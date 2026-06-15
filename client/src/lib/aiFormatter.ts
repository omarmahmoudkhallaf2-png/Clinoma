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

const FORMATTING_PROMPT = `أنت خبير تنسيق نصوص وشروحات طبية عالية الكفاءة. مهمتك هي أخذ النص الطبي الخام المرفق وإعادة صياغته وتنسيقه ليظهر بأعلى درجات الجاذبية والتنظيم البصري والوضوح الأكاديمي.

## القواعد الصارمة للتنسيق:

1. **العناوين والأقسام (مهم جداً)**:
   - حدد بوضوح العناوين الرئيسية والفرعية في النص (مثل: Definition & Etiology, Clinical Picture, Diagnosis, Treatment, Complications, Investigations).
   - حوّل العناوين الرئيسية للأقسام إلى عناوين Markdown كبيرة باستخدام البادئة \`##\` (مثال: \`## 🩺 Clinical Picture\` أو \`## 🔬 Diagnosis\`).
   - حوّل العناوين الأصغر أو النقاط الداخلية الفرعية إلى عناوين باستخدام البادئة \`###\` (مثال: \`### 🔬 Schirmer's Test\`).
   - لا تترك أي عنوان قسم أو موضوع فرعي كنص عادي أو قائمة نقطية بدون بادئة Markdown (\`##\` أو \`###\`). يجب أن تبدأ كل الأقسام ببادئات العناوين هذه لتكبيرها وتنسيقها تلقائياً.
   - ضع إيموجي طبي ملائم ومميز في بداية كل عنوان (🩺 شروحات إكلينيكية، 🔬 تشخيص، 💊 علاج، 🧬 جينات، 🧠 عصبية، 👁️ رمد، ⚠️ تحذير/مضاعفات، 📌 تعريف/مقدمة).

2. **الخط العريض (Bold)**:
   - اجعل المصطلحات الطبية المهمة، الكلمات المفتاحية، أو الفروقات التشخيصية عريضة باستخدام وسم BBCode \`[b]نص[/b]\` حصراً.
   - لا تستخدم الصيغة \`**\` للخط العريض أبداً.
   - تأكد تماماً من إغلاق وتداخل التاغات بشكل سليم دائماً (مثال: \`[color=#ef4444][b]نص[/b][/color]\` وليس \`[b][color=#ef4444]نص[/b][/color]\`).

3. **الخط المائل (Italic)**:
   - استخدم وسم \`[i]نص[/i]\` للمصطلحات اللاتينية أو الجانبية (لا تستخدم \`*\`).

4. **تظليل المصطلحات (Highlight)**:
   - استخدم ألوان Highlight جذابة ومتناسقة على الكلمات والمصطلحات المفتاحية. نوّع في استخدام هذه التاغات بالتناوب:
     * \`[highlight=#FBBF24]كلمة مهمة[/highlight]\` — أصفر ذهبي
     * \`[highlight=#34D399]مصطلح طبي[/highlight]\` — أخضر فاتح
     * \`[highlight=#A78BFA]تشخيص[/highlight]\` — بنفسجي
     * \`[highlight=#F87171]تحذير أو خطورة[/highlight]\` — أحمر فاتح
     * \`[highlight=#38BDF8]علاج أو دواء[/highlight]\` — أزرق سماوي
     * \`[highlight=#FB923C]فرق تشخيصي[/highlight]\` — برتقالي

5. **ألوان النصوص**:
   - لوّن بعض المصطلحات الأساسية لتمييزها باستخدام التاغات التالية:
     * \`[color=#2563EB]نص أزرق[/color]\` للأشياء الإيجابية أو التصنيفات.
     * \`[color=#DC2626]نص أحمر[/color]\` للتحذيرات، الخطورة، أو النسب العالية.
     * \`[color=#059669]نص أخضر[/color]\` للنسب الطبيعية أو النتائج السليمة.
     * \`[color=#7C3AED]نص بنفسجي[/color]\` للنظريات أو التفريعات.

6. **تخصيص أنواع الخطوط**:
   - للمصطلحات الإنجليزية والعناوين المكتوبة بالحروف اللاتينية، استخدم دائماً خط Outfit الحديث:
     \`[font=Outfit]English term[/font]\`
   - للنصوص العربية المميز أو الفقرات الهامة، استخدم خط القاهرة الكلاسيكي:
     \`[font=Cairo]شرح عربي بخط القاهرة[/font]\`

7. **تنسيق القوائم**:
   - رتب التفاصيل والنقاط الطبية الطويلة في قوائم نقطية منظمة باستخدام البادئة \`* \` أو \`- \`.

8. **تنظيم الفقرات والفواصل**:
   - قسّم النص إلى فقرات قصيرة ومريحة للعين.
   - ضع فاصلاً جميلاً بين الأقسام الكبيرة باستخدام ثلاثة خطوط \`---\` في سطر منفصل.

9. **الجداول (Markdown Tables)**:
   - إذا كان النص يحتوي على مقارنات، تصنيفات، أو إحصائيات، حولها فوراً إلى جدول Markdown منسق بشكل كامل.
   - تأكد أن جميع أسطر الجدول تحتوي على الفواصل \`|\` بشكل متناسق في كل خلية (مثال):
     \`| الغرض | الاختبار | الطريقة |\`
     \`|---|---|---|\`
     \`| الكمي | [font=Outfit]Schirmer's test[/font] | قياس إفراز الدموع |\`
   - لا تهمل علامات \`|\` في بداية ونهاية أي سطر من أسطر الجدول لضمان معالجته بشكل سليم.

## تعليمات الإنتاجية:
- لا تضف أي مقدمات أو خاتمة أو ملاحظات خارج النص الطبي المنسق.
- أرجع النص المنسق والمعدل مباشرة بدون كتابة أي كود برمجي إضافي أو وضعها بداخل علامات كود \`\`\` (فقط أرجع النص الصافي).
- نظف النص تماماً من أي تكرار أو كلمات مقطوعة أو أخطاء إملائية.

## النص الطبي الخام للبدء بتنسيقه:
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
