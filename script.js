// ناخذ العناصر اللازمة
const resultDiv = document.getElementById("resultMessage");
const searchBtn = document.getElementById("searchBtn");
const idInput = document.getElementById("idInput");

// موقع ملف CSV المنظّف
const DATA_URL = "data/hajj-data.csv"; // غيّر الاسم إذا غيرت اسم الملف

// نعرف ثلاثة قوالب (templates) للرسائل بناءً على رقم الرحلة بعد إزالة المسافات وغيرها
const templates = {
  "SV8043": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row"><span>الاسم:</span> {{FirstName}}</div>
    <div class="info-row"><span>العائلة:</span> {{LastName}}</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 10:00 ص من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) 
      الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV8043</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">
      تنويه: فضلاً التواجد بالمطار الساعة 7:00 قبل الرحلة بـ 3 ساعات.
    </div>
  `,

  "SV8049": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row"><span>الاسم:</span> {{FirstName}}</div>
    <div class="info-row"><span>العائلة:</span> {{LastName}}</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 12:55 ظهراً من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) 
      الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV8049</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">
      تنويه: فضلاً التواجد بالمطار الساعة 9:55 ص قبل الرحلة بـ 3 ساعات.
    </div>
  `,

  "SV8051": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row"><span>الاسم:</span> {{FirstName}}</div>
    <div class="info-row"><span>العائلة:</span> {{LastName}}</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 2:00 ظهراً من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) 
      الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV8051</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">
      تنويه: فضلاً التواجد بالمطار الساعة 11:00 ص قبل الرحلة بـ 3 ساعات.
    </div>
  `,
};

// نربط كل كود رحلة (بلا مسافات وأحرف غير أبجدية رقمية) بكلاس الـCSS المناسب
const colorClassMap = {
  "SV8043": "msg1",
  "SV8049": "msg2",
  "SV8051": "msg3",
};

// لما يضغط المستخدم على زر "ابحث"
searchBtn.addEventListener("click", () => {
  const idValue = idInput.value.trim();
  if (!idValue) {
    alert("يبيّ لك تدخل رقم الهوية أولاً.");
    return;
  }

  // نظّف أي نتيجة قديمة
  resultDiv.innerHTML = "";

  // اقرأ ملف CSV كامل مرة وحدة
  Papa.parse(DATA_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      console.log("📥 تم تحميل البيانات: ", results.data.slice(0,5));
      const records = results.data;

      // دور على السجل الي يطابق رقم الهوية المدخل
      const found = records.find((row) => row.ID === idValue);

      if (!found) {
        // ما لقيناه بملف البيانات
        resultDiv.innerHTML = `
          <div class="message-box" style="background-color: #eeeeee; color: #333;">
            <div class="info-row"><span>عذراً:</span> ما تم العثور على أي بيانات لرقم الهوية هذا.</div>
          </div>
        `;
        return;
      }

      // خذ بيانات الحاج من السطر
      const firstName = found.Name || "";
      const lastName = found.Family || "";
      const reservation = found["رقم الحجز"] || "";
      let flightCodeRaw = found["رقم الرحلة"] || "";
      // ازيل أي أحرف غير أحرف أو أرقام، فـ "SV 8043)" يصير "SV8043"
      const flightCode = flightCodeRaw.replace(/[^A-Za-z0-9]/g, "");

      // إذا الرحلة ما موجودة ضمن القوالب
      if (!templates[flightCode]) {
        resultDiv.innerHTML = `
          <div class="message-box" style="background-color: #ffecb3; color: #333;">
            <div class="info-row">
              <span>تنبيه:</span> الرحلة "${flightCodeRaw}" مو مضافة ضمن القوالب.
            </div>
          </div>
        `;
        return;
      }

      // جهّز المحتوى باستبدال العلامات
      const templateHtml = templates[flightCode]
        .replace("{{FirstName}}", \`\${firstName}\`)
        .replace("{{LastName}}", \`\${lastName}\`)
        .replace("{{Reservation}}", reservation);

      // اصنع صندوق الرسالة وأضف له الكلاس اللوني المناسب
      const box = document.createElement("div");
      box.classList.add("message-box", colorClassMap[flightCode]);
      box.innerHTML = templateHtml;

      // أضف للصندوق داخل النتيجة
      resultDiv.appendChild(box);
    },
    error: (err) => {
      console.error("خطأ في قراءة ملف البيانات:", err);
      resultDiv.innerHTML = `
        <div class="message-box" style="background-color: #ffcdd2; color: #333;">
          <div class="info-row"><span>خطأ:</span> ما قدرنا نقرأ ملف البيانات.</div>
        </div>
      `;
    },
  });
});
