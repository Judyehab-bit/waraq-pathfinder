# Waraq: Your Official Guide

Build a fully functional, responsive web application called “WARAQ” (ورق), an Egyptian paperwork and official-services navigation platform.

IMPORTANT:

This must be a WORKING MVP, not just a visual prototype.

All buttons, forms, navigation, checklists, filters, progress indicators, modals, chatbot interactions, and feedback forms should actually work.

Prioritize functionality, simplicity, and a polished user experience.

The website must work beautifully on both mobile and desktop, with mobile-first design because most users will access it from their phones.

========================================

1. BRAND & VISUAL IDENTITY

========================================

App name:

WARAQ

The logo is provided as an attached image/reference.

Use the provided WARAQ logo as the main brand logo throughout the website.

Brand personality:

- Friendly

- Trustworthy

- Calm

- Helpful

- Modern

- Accessible

- Egyptian but not overly governmental

- Simple enough for teenagers and young adults, but also easy for elderly users

The UI should feel comforting rather than bureaucratic.

Avoid:

- Complicated government-portal-looking interfaces

- Excessive text

- Tiny fonts

- Overly bright colors

- Too many buttons

- Cluttered dashboards

Use:

- Soft, comfortable colors

- Rounded cards

- Generous spacing

- Clear typography

- Large readable buttons

- Simple icons

- Friendly illustrations

- Subtle shadows

- Smooth micro-interactions

- Clear progress indicators

The design should feel like a modern startup product, not a government website.

Use the WARAQ logo and its visual identity consistently.

========================================

2. LANGUAGE

========================================

The primary interface should be Arabic with clear Egyptian-friendly wording.

Use simple Arabic instead of complicated legal/government terminology whenever possible.

However, keep the brand name “WARAQ” in English.

Optionally include an Arabic/English language toggle in the header.

The UI must support RTL correctly when Arabic is selected.

========================================

3. LANDING / WELCOME SCREEN

========================================

When the user opens WARAQ, show a clean welcome screen.

Display:

WARAQ logo

Headline:

"ورقك من غير قلق"

Subheadline:

"نعرفك إيه اللي محتاجه، تجيبه منين، وتخلصه خطوة بخطوة."

Then introduce the service briefly:

"WARAQ helps you understand and prepare for official procedures without the confusion of missing documents, unclear requirements, or unnecessary trips."

Primary button:

"ابدأ دلوقتي"

========================================

4. USER PROFILE SETUP

========================================

When the user clicks "ابدأ دلوقتي", open a simple onboarding form.

Ask:

- Full name

- Age

- Governorate / City

- Optional location permission

Explain why location is useful:

"هنستخدم موقعك فقط عشان نساعدك تلاقي أقرب مكان تقدر تطلع منه الورق اللي محتاجه."

Then provide an OPTIONAL document upload section:

"عندك أوراق بالفعل؟"

"ارفعها هنا واختار إيه اللي معاك، وهنستخدمها عشان نحدد إيه اللي ناقصك."

Allow users to:

- Upload PDF

- Upload image

- Select document type

- Skip this step

Important:

Do NOT require document uploads.

Show privacy reassurance:

"معلوماتك الشخصية ومستنداتك حساسة. لا ترفع أي مستند إلا إذا كنت مرتاحًا لذلك."

Primary button:

"كمّل"

Store the profile information locally for the MVP.

========================================

5. SERVICES HOME

========================================

After onboarding, take the user to the main services page.

Header:

WARAQ logo

User greeting:

"أهلاً يا [Name] 👋"

Show a search bar:

"بتدور على خدمة معينة؟"

Then show:

"اختار الخدمة اللي محتاج تخلصها"

Services should appear as visual cards with:

- Image/illustration

- Service name

- Short description

Example services:

1. Passport

Image: passport

Name: "استخراج جواز سفر"

2. National ID

Image: Egyptian ID card

Name: "بطاقة الرقم القومي"

3. Birth Certificate

Image: birth certificate

Name: "شهادة ميلاد"

4. Driver's License

Image: driving license/car

Name: "رخصة قيادة"

5. University Registration

Image: university/student

Name: "إجراءات الجامعة"

6. Employment / Job Documents

Image: briefcase

Name: "أوراق التوظيف"

7. Bank Services

Image: bank

Name: "خدمات بنكية"

8. Add more services

Card:

"خدمة أخرى"

For the MVP, create realistic sample data for several Egyptian procedures.

========================================

6. SERVICE QUESTIONS

========================================

When a user selects a service, DO NOT immediately show the checklist.

First, ask contextual questions that determine which documents and steps they need.

For example, for Passport:

Question:

"إيه نوع الطلب؟"

Options:

- أول مرة

- تجديد

- بدل فاقد

- بدل تالف

- انتهت صلاحيته

Then ask relevant questions depending on the answer.

Example:

"هل معاك جواز السفر القديم؟"

"هل بياناتك الشخصية اتغيرت؟"

"هل أنت فوق السن المطلوب؟"

Only show questions relevant to the selected service.

Create a dynamic questionnaire system where later questions depend on previous answers.

After completing the questions, show:

"تمام! جهزنا لك الخطوات المناسبة لحالتك."

========================================

7. PERSONALIZED PROCEDURE PLAN

========================================

This is the CORE feature of WARAQ.

Based on:

- User profile

- Selected service

- Answers to questions

- Documents the user already uploaded/has

Generate a personalized step-by-step procedure.

Example:

"استخراج جواز سفر لأول مرة"

Progress:

"1 من 5 خطوات"

Step 1:

"جهّز بطاقة الرقم القومي"

Status:

✅ معاك

Step 2:

"جهّز شهادة الميلاد"

Status:

❌ ناقصة

Step 3:

"جهّز الصور الشخصية"

Status:

❌ ناقصة

Step 4:

"قدّم الطلب"

Step 5:

"استلم جواز السفر"

Each step should be expandable.

========================================

8. DOCUMENT DETAILS

========================================

When the user clicks a required document, show a detailed document card/page.

Example:

"شهادة الميلاد"

Show:

- لماذا تحتاجها؟

- من أين تحصل عليها؟

- ما المطلوب لاستخراجها؟

- هل يمكن استخراجها online؟

- هل تحتاج إلى الذهاب لمكان؟

- Estimated cost

- Estimated time

- Opening hours when applicable

- Required identification

- Notes

- Accessibility information when available

Use simple language.

Example:

"لو مش معاك شهادة الميلاد:

1. روح إلى أقرب مكان يقدم الخدمة.

2. خليك معاك بطاقة الرقم القومي.

3. اطلب شهادة ميلاد مميكنة.

4. راجع البيانات قبل ما تستلمها."

========================================

9. LOCATION-BASED HELP

========================================

If a required document needs to be obtained from a physical location, use the user's city/location to show nearby relevant places.

Examples:

- Banks

- Government service locations

- Printing shops

- Photo studios

- Universities

- Other relevant service providers

Each location card should show:

- Name

- Distance if location is available

- Address

- Opening hours

- Estimated travel time if possible

- Accessibility information if available

- "View on Map" button

If real map/location APIs are unavailable for the MVP, use realistic mock locations and clearly structure the system so a real maps API can be connected later.

DO NOT fabricate official government information and present it as verified.

Clearly label sample/mock data when actual live data is unavailable.

========================================

10. COST ESTIMATES

========================================

For each document or step that may have a cost, show:

"التكلفة المتوقعة"

Example:

"متوقع: 50–100 EGP"

Do not claim that an estimate is an official fixed price unless verified.

Use wording such as:

"تقديري"

"قد تختلف التكلفة حسب المكان"

========================================

11. PRINTABLE DOCUMENTS / PDFs

========================================

If a required document is something the user can print at home:

Show:

"تقدر تطبع النموذج ده في البيت."

Button:

"تحميل PDF"

For the MVP, create sample PDF/document links or downloadable placeholder PDFs where appropriate.

If a document requires an official stamp/signature:

Clearly explain:

- Where the stamp/signature is obtained

- Which institution provides it

- What the user should bring

- Approximate opening hours if available

- Whether an appointment is required if known

========================================

12. CHECKLIST

========================================

Every service must have a clear checklist.

Example:

"Checklist الخاصة بيك"

☑ بطاقة الرقم القومي

☑ شهادة الميلاد

☐ الصور الشخصية

☐ نموذج الطلب

Each item should be clickable.

When the user confirms they have completed a requirement:

- Change it to completed

- Show a checkmark

- Update progress

Example:

"2 / 4 مكتمل"

Add a visual progress bar.

When everything is completed:

Show a success screen:

"🎉 أنت جاهز!"

"جمعت كل المستندات المطلوبة."

Button:

"كمّل تقديم الطلب"

========================================

13. OFFICIAL PLATFORM REDIRECT

========================================

IMPORTANT:

WARAQ does NOT pretend to replace official government services.

WARAQ helps users PREPARE.

When the user completes all preparation steps, show:

"كل حاجة جاهزة! 🎉"

"دلوقتي تقدر تكمل الإجراء من خلال منصة مصر الرقمية."

Primary button:

"الانتقال إلى مصر الرقمية"

The button should open the official Egypt Digital platform in a new tab/window.

Make it clear that WARAQ is a navigation/preparation assistant and the official government platform is responsible for the actual government transaction.

========================================

14. FEEDBACK SURVEY

========================================

After the user finishes or reaches the end of a procedure, show a feedback survey.

Headline:

"إيه رأيك في تجربتك مع WARAQ؟"

Ask:

1. "سهولة استخدام WARAQ من 1 إلى 5"

Use star rating.

2. "قد إيه WARAQ ساعدك تفهم المطلوب؟"

1–5

3. "هل وفّر عليك وقت أو مجهود؟"

- نعم

- إلى حد ما

- لا

4. "إيه أكتر حاجة ساعدتك؟"

5. "إيه الحاجة اللي محتاجين نحسنها؟"

6. "هل هتستخدم WARAQ تاني؟"

- أكيد

- ممكن

- لا

Submit button:

"إرسال التقييم"

After submission:

"شكرًا! رأيك بيساعدنا نخلي WARAQ أسهل ❤️"

Store feedback locally for the MVP.

========================================

15. AI CHATBOT

========================================

Add a floating circular AI assistant button in the bottom-right corner of the screen.

It should be visible throughout the main app.

Icon:

Friendly AI/chat icon.

Label on hover:

"محتاج مساعدة؟"

When clicked, open a small chat window.

Header:

"WARAQ Assistant 🤖"

Welcome message:

"أهلاً! محتاج مساعدة في أي خطوة؟"

The chatbot should be able to answer questions based on the current service and checklist.

Example:

User:

"أنا مش معايا شهادة الميلاد، أعمل إيه؟"

Bot:

"ولا يهمك! شهادة الميلاد مطلوبة في الخطوة دي. دوس هنا عشان تعرف أقرب مكان تقدر تطلعها منه والمستندات المطلوبة."

Possible quick actions:

- "إيه اللي ناقصني؟"

- "أطلع الورقة دي منين؟"

- "الخطوة الجاية إيه؟"

- "كام ورقة فاضلة؟"

For the MVP, if a real AI API is not available, implement a rule-based contextual chatbot using the current service data.

DO NOT create a fake chatbot that claims to know information that isn't in the database.

========================================

16. NAVIGATION

========================================

Use a very simple navigation system.

Desktop:

Top navigation:

- Home

- My Procedures

- My Documents

- Help

Mobile:

Bottom navigation:

🏠 Home

📋 My Procedures

📄 My Documents

❓ Help

Keep navigation minimal.

========================================

17. MY PROCEDURES

========================================

Create a page showing previous and current procedures.

Example:

"إجراءاتي"

🟢 Passport

"80% complete"

🟡 University Registration

"40% complete"

Allow the user to click a procedure and continue where they left off.

========================================

18. MY DOCUMENTS

========================================

Create a simple document wallet.

Show uploaded documents as cards.

Each document:

- Document name

- Type

- Upload date

- Expiration date if applicable

- Status

Example:

National ID

"Valid"

Passport

"Expires in 4 months"

Add expiration reminders.

IMPORTANT:

For the MVP, documents can be stored locally or represented through local mock storage.

Do not claim that sensitive uploaded documents are securely stored on a production server unless real secure backend storage has been implemented.

========================================

19. ACCESSIBILITY

========================================

Accessibility is one of WARAQ's core values.

Implement:

- Large readable fonts

- High contrast option

- Clear focus states

- Keyboard navigation

- Screen-reader-friendly labels

- Large tap targets

- Simple language

- Minimal text per screen

- Arabic RTL support

- Optional voice/read-aloud button for important instructions

- Avoid relying only on color to communicate status

Add an accessibility settings menu.

Options:

Text size:

- Normal

- Large

- Extra Large

Contrast:

- Normal

- High Contrast

Language:

- Arabic

- English

========================================

20. ERROR STATES

========================================

Design helpful error messages.

Instead of:

"Error 404"

Use:

"مش قادرين نجيب البيانات دلوقتي. حاول تاني بعد شوية."

If location permission is denied:

"مفيش مشكلة! تقدر تختار المحافظة والمنطقة يدويًا."

If document upload fails:

"الملف مرفعش. جرّب صورة أو PDF أصغر."

========================================

21. DATA STRUCTURE

========================================

Create the app using structured service data.

Each service should contain:

- serviceName

- image

- description

- questions

- possibleAnswers

- requiredDocuments

- steps

- documentInstructions

- estimatedCosts

- estimatedTimes

- locations

- openingHours

- accessibilityInfo

- officialLink

- lastUpdated

This should make it easy to add new services later without rewriting the entire application.

========================================

22. MVP SERVICES

========================================

For the working demo, prioritize a few complete services instead of creating many incomplete ones.

Build at least these fully:

1. Passport

2. National ID

3. Birth Certificate

4. Driver's License

Make each one have:

- Questions

- Personalized requirements

- Checklist

- Document details

- Steps

- Cost estimates

- Location guidance

- Completion state

Additional services can be shown as "Coming Soon".

========================================

23. IMPORTANT PRODUCT POSITIONING

========================================

WARAQ is NOT a replacement for Egyptian government platforms.

WARAQ is a preparation and navigation layer that helps users understand:

"What do I need?"

"Where do I get it?"

"How do I get it?"

"How much might it cost?"

"When can I go?"

"What do I already have?"

"What am I still missing?"

"What is my next step?"

Only after the user is fully prepared does WARAQ direct them to the official platform/institution.

========================================

24. SECURITY & TRUST

========================================

Because users may upload sensitive documents:

- Never expose uploaded documents publicly.

- Do not use real user data in sample data.

- Do not log sensitive document contents.

- Clearly explain what information is being used.

- Provide a delete option for uploaded documents.

- Use mock/sample documents for the demo if proper secure storage is not implemented.

========================================

25. RESPONSIVE DESIGN

========================================

The website must look excellent on:

- Mobile phones

- Tablets

- Laptops

- Desktop

Mobile should be the priority.

On mobile:

- Use bottom navigation

- Full-width cards

- Large buttons

- Sticky progress/checklist where useful

- Floating AI button

- Avoid horizontal scrolling

========================================

26. MICRO-INTERACTIONS

========================================

Add subtle animations:

- Button hover

- Card hover

- Checklist completion animation

- Progress bar animation

- Success animation

- Smooth page transitions

- Chatbot opening animation

Keep animations subtle and professional.

========================================

27. FINAL USER JOURNEY

========================================

The complete user journey should be:

OPEN WARAQ

↓

See logo + tagline

↓

Start

↓

Enter name + age + location

↓

Optionally upload existing documents

↓

Services dashboard

↓

Choose a service

↓

Answer personalized questions

↓

Receive personalized procedure plan

↓

See required documents

↓

See how/where to obtain each document

↓

See estimated cost/time

↓

See nearby relevant locations

↓

Complete checklist

↓

Reach 100%

↓

"You're ready!"

↓

Redirect to official Egypt Digital platform

↓

Return to WARAQ

↓

Complete feedback survey

↓

Continue using WARAQ for another procedure

========================================

28. FINAL DESIGN GOAL

========================================

The most important feeling should be:

"I was confused about the paperwork, but WARAQ told me exactly what to do."

The user should NEVER feel lost.

Every screen should answer one of these questions:

1. What am I trying to do?

2. What do I need?

3. What do I already have?

4. What's missing?

5. Where do I get it?

6. What's the next step?

Create a polished, realistic, fully interactive MVP that can be demonstrated live in a competition tonight.

Prioritize the core user journey and functionality over unnecessary features.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://waraq-pathfinder.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b00ae99b-46fa-4ee8-9a84-fe0d73295a85).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
