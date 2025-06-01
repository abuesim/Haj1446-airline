// عناصر الصفحة
const resultDiv = document.getElementById("resultMessage");
const searchBtn = document.getElementById("searchBtn");
const idInput = document.getElementById("idInput");
const DATA_URL = "data/hajj-data.csv";

// قوالب الرسائل
const templates = {
  "SV8043": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row"><span>الاسم:</span> {{FirstName}}</div>
    <div class="info-row"><span>العائلة:</span> {{LastName}}</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 10:00 ص من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV8043</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">تنويه: فضلاً التواجد بالمطار الساعة 7:00 قبل الرحلة بـ 3 ساعات.</div>
  `,
  "SV8049": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row"><span>الاسم:</span> {{FirstName}}</div>
    <div class="info-row"><span>العائلة:</span> {{LastName}}</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 12:55 ظهراً من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV8049</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">تنويه: فضلاً التواجد بالمطار الساعة 9:55 ص قبل الرحلة بـ 3 ساعات.</div>
  `,
  "SV8051": `
    <div class="info-row"><span>أخي الحاج:</span></div>
    <div class="info-row"><span>الاسم:</span> {{FirstName}}</div>
    <div class="info-row"><span>العائلة:</span> {{LastName}}</div>
    <div class="info-row">
      نود ابلاغكم بأن موعد إقلاع الرحلة يوم الأربعاء 8 ذو الحجة، الساعة 2:00 ظهراً من مطار الملك خالد بمدينة الرياض (صالة رقم ٥) الدخول من بوابة رقم (1)،(2) منطقة (B) منصات المعاينة رقم B3 إلى B12
    </div>
    <div class="info-row">•  رقم الرحلة: SV8051</div>
    <div class="info-row">•  رقم الحجز: {{Reservation}}</div>
    <div class="info-row">تنويه: فضلاً التواجد بالمطار الساعة 11:00 ص قبل الرحلة بـ 3 ساعات.</div>
  `,
};

// ربط الرحلات بالألوان
const colorClassMap = {
  "SV8043": "msg1",
  "SV8049": "msg2",
  "SV8051": "msg3",
};

searchBtn.addEventListener("click", () => {
  const idValue = idInput.value.trim();
  console.log("🔍 البحث عن الهوية:", idValue);
  if (!idValue) {
    alert("يبيّ لك تدخل رقم الهوية أولاً.");
    return;
  }
  resultDiv.innerHTML = "";
  Papa.parse(DATA_URL, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      console.log("📥 البيانات المحمّلة:", results.data.slice(0,5));
      const records = results.data;
      const found = records.find(row => row.ID === idValue);
      console.log("🔎 السجل المستخدَم:", found);
      if (!found) {
        resultDiv.innerHTML = `
          <div class="message-box" style="background-color: #eeeeee; color: #333;">
            <div class="info-row"><span>عذراً:</span> ما تم العثور على أي بيانات لرقم الهوية هذا.</div>
          </div>`;
        return;
      }
      const firstName = found.Name || "";
      const lastName = found.Family || "";
      const reservation = found["رقم الحجز"] || "";
      let flightCodeRaw = found["رقم الرحلة"] || "";
      const flightCode = flightCodeRaw.replace(/[^A-Za-z0-9]/g, "");
      console.log("✈️ رمز الرحلة المنظف:", flightCode);
      if (!templates[flightCode]) {
        resultDiv.innerHTML = `
          <div class="message-box" style="background-color: #ffecb3; color: #333;">
            <div class="info-row"><span>تنبيه:</span> الرحلة "${flightCodeRaw}" مو مضافة ضمن القوالب.</div>
          </div>`;
        return;
      }
      const templateHtml = templates[flightCode]
        .replace("{{FirstName}}", \`\${firstName}\`)
        .replace("{{LastName}}", \`\${lastName}\`)
        .replace("{{Reservation}}", reservation);
      const box = document.createElement("div");
      box.classList.add("message-box", colorClassMap[flightCode]);
      box.innerHTML = templateHtml;
      resultDiv.appendChild(box);
    },
    error: (err) => {
      console.error("خطأ في قراءة ملف البيانات:", err);
      resultDiv.innerHTML = `
        <div class="message-box" style="background-color: #ffcdd2; color: #333;">
          <div class="info-row"><span>خطأ:</span> ما قدرنا نقرأ ملف البيانات.</div>
        </div>`;
    }
  });
});
