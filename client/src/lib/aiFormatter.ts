/**
 * AI Note Formatter — Gemini 2.5 Flash
 * 
 * Uses 3 API keys in round-robin rotation.
 * Sends raw text and returns beautifully formatted BBCode/Markdown
 * compatible with the FlashSpace editor format.
 */

const FORMATTER_KEYS = [
  "AQ.Ab8RN6KcQCVRi7ciw8HleEC1Roaj6CbM9MzTGeUS01Ps4fJRJQ",
  "AQ.Ab8RN6JriojoEmeK_UsPlz7WRvLB2kvV4oYGSLsMxCwUMgDR3A",
  "AQ.Ab8RN6JarYwS0XdvKCujlqIwEwXcTWoEmHYi_EHRE0FWLuitCw",
];

const FORMATTER_MODEL = "gemini-2.5-flash";

// Global round-robin counter (persists across calls within the session)
let _rrIndex = 0;

function getNextKey(): string {
  const key = FORMATTER_KEYS[_rrIndex % FORMATTER_KEYS.length];
  _rrIndex++;
  return key;
}

const FORMATTING_PROMPT = `أنت خبير تنسيق نصوص طبية. مهمتك هي أخذ النص الخام التالي وإرجاعه بتنسيق غني وجميل.

## القواعد الصارمة:

1. **نظّف النص**: أزل أي رموز غريبة أو أحرف غير مفهومة أو تكرارات غير ضرورية.
2. **العناوين**: حوّل العناوين الرئيسية لعناوين كبيرة باستخدام \`# عنوان\` للعنوان الرئيسي و \`## عنوان\` للفرعي و \`### عنوان\` للأصغر.
3. **Bold**: اجعل الكلمات والمصطلحات المهمة **عريضة** باستخدام \`**نص**\`.
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

  const key = getNextKey();

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

  // Try v1beta first, then v1
  const versions = ["v1beta", "v1"];
  for (const version of versions) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for formatting

    try {
      const url = `https://generativelanguage.googleapis.com/${version}/models/${FORMATTER_MODEL}:generateContent?key=${key}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 429 || response.status === 403) {
        continue; // Try next version
      }

      if (response.ok) {
        const data = await response.json();
        const formatted =
          data.candidates?.[0]?.content?.parts?.[0]?.text || "";

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
      if (err.name === "AbortError") {
        throw new Error("انتهت مهلة الطلب. حاول مرة أخرى.");
      }
      continue;
    }
  }

  throw new Error(
    "فشل تنسيق النص. جميع المحاولات فشلت. حاول مرة أخرى لاحقاً."
  );
}
