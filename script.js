// ناخذ العناصر اللازمة
const resultDiv = document.getElementById("resultMessage");
const searchBtn = document.getElementById("searchBtn");
const idInput = document.getElementById("idInput");

// موقع ملف CSV المنظّف
const DATA_URL = "data/hajj-data.csv"; // غيّر الاسم إذا غيرت اسم الملف

// نعرف ثلاثة قوالب (templates) للرسائل بناءً على رقم الرحلة
const templates = {
  "SV 8043": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row">( {{NameFamily}} )</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 10:00 ص من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) 
      الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV 8043</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">
      تنويه: فضلاً التواجد بالمطار الساعة 7:00 قبل الرحلة بـ 3 ساعات.
    </div>
  `,

  "SV 8049": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row">( {{NameFamily}} )</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 12:55 ظهراً من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) 
      الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV 8049</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">
      تنويه: فضلاً التواجد بالمطار الساعة 9:55 ص قبل الرحلة بـ 3 ساعات.
    </div>
  `,

  "SV 8051": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row">( {{NameFamily}} )</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 2:00 ظهراً من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) 
      الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV 8051</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">
      تنويه: فضلاً التواجد بالمطار الساعة 11:00 ص قبل الرحلة بـ 3 ساعات.
    </div>
  `,
};

// نربط كل كود رحلة بكلاس الـCSS المناسب
const colorClassMap = {
  "SV 8043": "msg1",
  "SV 8049": "msg2",
  "SV 8051": "msg3",
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
      const flightCode = found["رقم الرحلة"] || "";

      // إذا الرحلة ما موجودة ضمن الثلاث قوالب
      if (!templates[flightCode]) {
        resultDiv.innerHTML = `
          <div class="message-box" style="background-color: #ffecb3; color: #333;">
            <div class="info-row">
              <span>تنبيه:</span> الرحلة "\${flightCode}" مو مضافة ضمن القوالب.
            </div>
          </div>
        `;
        return;
      }

      // جهّز المحتوى باستبدال العلامات
      const templateHtml = templates[flightCode]
        .replace("{{NameFamily}}", \`\${firstName} \${lastName}\`)
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
