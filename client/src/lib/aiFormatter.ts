/**
 * AI Note Formatter — Gemini 2.5 Flash
 * 
 * Uses 3 API keys in round-robin rotation.
 * Sends raw text and returns beautifully formatted BBCode/Markdown
 * compatible with the FlashSpace editor format.
 */

function getFormatterKeys(): string[] {
  const localKeys = localStorage.getItem("admin_gemini_keys");
  if (localKeys) {
    return localKeys.split(',').map((k: string) => k.trim()).filter(Boolean);
  }
  const envKeys = import.meta.env.VITE_GEMINI_KEYS;
  if (envKeys) {
    return envKeys.split(',').map((k: string) => k.trim()).filter(Boolean);
  }
  return [
    "AQ.Ab8RN6KcQCVRi7ciw8HleEC1Roaj6CbM9MzTGeUS01Ps4fJRJQ",
    "AQ.Ab8RN6JriojoEmeK_UsPlz7WRvLB2kvV4oYGSLsMxCwUMgDR3A",
    "AQ.Ab8RN6JarYwS0XdvKCujlqIwEwXcTWoEmHYi_EHRE0FWLuitCw"
  ];
}

let _rrIndex = 0;

const FORMATTING_PROMPT = `أنت خبير تنسيق نصوص طبية. مهمتك هي أخذ النص الخام التالي وإرجاعه بتنسيق غني وجميل.

## القواعد الصارمة:

1. **نظّف النص**: أزل أي رموز غريبة أو أحرف غير مفهومة أو تكرارات غير ضرورية.
2. **العناوين**: حوّل العناوين الرئيسية لعناوين كبيرة باستخدام \`# عنوان\` للعنوان الرئيسي و \`## عنوان\` للفرعي و \`### عنوان\` للأصغر.
3. **Bold**: اجعل الكلمات والمصطلحات المهمة **عريضة** باستخدام \`[b]نص[/b]\` (لا تستخدم \`**\` للخط العريض). تأكد من تداخل التاغات بشكل سليم دائماً (مثل: \`[color=...][b]نص[/b][/color]\` وليس \`[b][color=...]نص[/b][/color]\`).
3.1. **Italic**: اجعل الكلمات المائلة باستخدام \`[i]نص[/i]\` (لا تستخدم \`*\` للمائل).
4. **Highlight بألوان متنوعة**: استخدم ألوان highlight مختلفة ومتناسقة على الكلمات والمصطلحات المهمة. استخدم هذه الألوان بالتناوب:
   - \`[highlight=#FBBF24]كلمة مهمة[/highlight]\` — أصفر ذهبي
   - \`[highlight=#34D399]مصطلح طبي[/highlight]\` — أخضر فاتح
   - \`[highlight=#A78BFA]تشخيص[/highlight]\` — بنفسجي
   - \`[highlight=#F87171]تحذير مهم[/highlight]\` — أحمر فاتح
   - \`[highlight=#38BDF8]علاج[/highlight]\` — أزرق سماوي
   - \`[highlight=#FB923C]فرق تشخيصي[/highlight]\` — برتقالي
5. **ألوان النص**: نوّع ألوان بعض العناوين الفرعية والمصطلحات:
   - \`[color=#2563EB]نص أزرق[/color]\`
   - \`[color=#DC2626]نص أحمر[/color]\`
   - \`[color=#059669]نص أخضر[/color]\`
   - \`[color=#7C3AED]نص بنفسجي[/color]\`
   - \`[color=#D97706]نص برتقالي[/color]\`
6. **أحجام الخطوط**: استخدم أحجام مختلفة للتنويع:
   - \`[size=22px]عنوان كبير[/size]\` للعناوين الرئيسية
   - \`[size=18px]عنوان فرعي[/size]\` للعناوين الفرعية
   - النص العادي بدون تحديد حجم
   - \`[size=14px]ملاحظة صغيرة[/size]\` للملاحظات
7. **أنواع الخطوط**: نوّع في الخطوط:
   - \`[font=Cairo]نص بخط القاهرة[/font]\` للنصوص العربية
   - \`[font=Outfit]English terms[/font]\` للمصطلحات الإنجليزية
   - \`[font=Fredoka]نص مميز[/font]\` للنقاط البارزة
8. **القوائم**: استخدم \`* عنصر\` لعمل قوائم منظمة.
9. **الفواصل**: استخدم \`---\` لفصل الأقسام الكبيرة.
10. **الجداول**: إذا كان مناسباً، استخدم جداول Markdown:
    \`| عمود 1 | عمود 2 |\`
    \`|--------|--------|\`
    \`| قيمة 1 | قيمة 2 |\`

## تعليمات إضافية:
- لا تضف أي شرح أو تعليق خارج النص المنسق.
- أعد النص المنسق فقط بدون أي مقدمة أو خاتمة.
- حافظ على المحتوى الأصلي ومعناه، فقط حسّن التنسيق والعرض.
- اجعل النص جذاباً بصرياً ومنظماً وسهل القراءة.
- استخدم الإيموجي الطبية المناسبة (🔬 💊 🩺 ⚠️ ✅ 📌 💡 🧬 🫀 🧠 👁️) عند العناوين.
- لا تبالغ في التنسيق — اجعله متوازناً وأنيقاً.

## النص الخام:
`;

/**
 * Format raw note text using Gemini AI.
 * Returns formatted BBCode/Markdown text ready for the editor.
 */
export async function formatNoteWithAI(rawText: string): Promise<string> {
  if (!rawText.trim()) {
    throw new Error("النص فارغ. اكتب نصاً أولاً ثم اضغط تنسيق.");
  }

  // Check if keys are configured in localStorage or env variables
  const hasLocalKeys = !!localStorage.getItem("admin_gemini_keys");
  const hasEnvKeys = !!import.meta.env.VITE_GEMINI_KEYS;

  if (!hasLocalKeys && !hasEnvKeys) {
    const input = prompt("الرجاء إدخال مفتاح Gemini API الخاص بك لتفعيل التنسيق بالذكاء الاصطناعي (مفتاح واحد أو أكثر مفصولة بفاصلة ,):");
    if (!input || !input.trim()) {
      throw new Error("لم يتم إدخال مفتاح API. تم إلغاء عملية التنسيق.");
    }
    localStorage.setItem("admin_gemini_keys", input.trim());
  }

  const keys = getFormatterKeys();
  if (keys.length === 0) {
    throw new Error("لم يتم العثور على مفتاح API نشط.");
  }

  const key = keys[_rrIndex % keys.length];
  _rrIndex++;

  const payload = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${FORMATTING_PROMPT}\n${rawText}` }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  };

  const models = [
    "gemini-3.1-flash-lite",
    "gemini-3-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
  ];

  for (const model of models) {
    for (const version of ["v1beta", "v1"]) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s per call

      try {
        const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${key}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.status === 401 || response.status === 403 || response.status === 400) {
          const bodyText = await response.text();
          if (bodyText.includes("leaked") || bodyText.includes("revoked") || bodyText.includes("credentials") || bodyText.includes("API key not valid")) {
            // Clear the invalid keys from local storage so it prompts again next time
            localStorage.removeItem("admin_gemini_keys");
            throw new Error("مفتاح API الخاص بك غير صالح أو تم إيقافه (تم كشف تسريبه على GitHub). يرجى المحاولة مرة أخرى وإدخال مفتاح جديد صالح.");
          }
          continue; // Try next model/version combination
        }

        if (response.ok) {
          const data = await response.json();
          const formatted = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

          if (!formatted.trim()) {
            throw new Error("الذكاء الاصطناعي لم يرجع نص. حاول مرة أخرى.");
          }

          // Clean any markdown code fences the model might wrap
          return formatted
            .replace(/^```[\w]*\n?/gm, "")
            .replace(/\n?```$/gm, "")
            .trim();
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        if (err.message.includes("تسريبه") || err.message.includes("غير صالح") || err.message.includes("إلغاء")) {
          throw err;
        }
        if (err.name === "AbortError") {
          continue;
        }
        // Network errors or other API issues, continue loop
      }
    }
  }

  // If it gets here and failed, let's also clear localStorage in case the key itself is generally bad
  localStorage.removeItem("admin_gemini_keys");
  throw new Error(
    "فشل تنسيق النص. تأكد من صحة مفاتيح الـ API المضافة وصلاحية حسابك."
  );
}
