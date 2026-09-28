# LearnSpace E-Learning

ระบบ e-learning ขนาดเล็กสำหรับจัดการหลักสูตร บทเรียน ผู้สอน และผู้เรียน พัฒนาด้วย React, Node.js, Express และ MongoDB

## ความสามารถหลัก

- สิทธิ์ 3 ระดับ: Admin, Instructor และ User
- Admin จัดการผู้ใช้ ผู้สอน และทุกหลักสูตรได้
- Instructor สร้างและแก้ไขเฉพาะหลักสูตรของตน รวมถึงผู้เรียน เนื้อหา และบทเรียน
- หลักสูตรมีสถานะฉบับร่าง/เปิดใช้งาน และกำลังดำเนินการ/จบหลักสูตรแล้ว
- แต่ละหลักสูตรแบ่งเป็นหลายบทและแนบลิงก์ YouTube ได้

## Runtime ที่กำหนด

- Node.js `24.21.0`
- npm `11.19.0`
- MongoDB Atlas, MongoDB Community Server หรือ MongoDB ที่เข้าถึงผ่าน connection string ได้

เวอร์ชัน Node ถูกกำหนดใน `.nvmrc` และ `engines` ของทั้ง backend/frontend ส่วน npm ถูกกำหนดด้วย `packageManager` และ `engines` ห้ามใช้ runtime คนละเวอร์ชันเพราะเปิด `engine-strict=true` ไว้

## Dependencies

โปรเจกต์ใช้ npm workspaces โดยมี `front-knowledge` เป็น workspace จึงติดตั้ง dependency ทั้ง backend และ frontend ไว้จาก root ด้วย `node_modules` และ `package-lock.json` ชุดเดียว dependency โดยตรงระบุเป็นเวอร์ชันตายตัว ส่วน dependency ย่อยทั้งหมดถูกตรึงใน lockfile

ไม่มี lockfile แยกใน frontend และไม่มี `yarn.lock` เพื่อป้องกันข้อมูลเวอร์ชันขัดกัน ใช้ `npm ci` จาก root เท่านั้น และห้ามใช้ `npm install` ในขั้นตอน deploy

> หมายเหตุ: ระบบใช้ dependency รุ่น legacy ที่ล็อกไว้เพื่อรักษาความเข้ากันได้ จึงอาจมีคำเตือน deprecated/security จาก `npm audit`; การอัปเกรด major version ควรทำเป็นงาน migration แยกและทดสอบทั้งระบบ

## Environment variables

คัดลอก `.env.example` เป็น `.env` แล้วกำหนดค่าดังนี้:

```dotenv
MONGODB_URI="mongodb+srv://<username>:<password>@<cluster>/<database>?retryWrites=true&w=majority"
MONGODB_DB="knowlegegsb"
PORT=5001
JWT_SECRET="<long-random-string>"
```

| ตัวแปร | จำเป็น | ค่าปริยาย | จุดที่ใช้ |
| --- | --- | --- | --- |
| `MONGODB_URI` | ใช่ | ไม่มี | connection string ใน `config/db.js` |
| `MONGODB_DB` | ไม่ | `knowlegegsb` | ชื่อฐานข้อมูลใน `config/db.js` |
| `PORT` | ไม่ | `5001` | พอร์ต backend ใน `server.js` |
| `JWT_SECRET` | ใช่ | ไม่มี | ใช้ลงนาม token ใน `utils/jwtSecret.js` — server จะไม่ start ถ้าไม่กำหนด |

สร้างค่า `JWT_SECRET` แบบสุ่มได้ด้วย `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` การเปลี่ยนค่านี้จะทำให้ผู้ใช้ทุกคนต้อง login ใหม่

`NODE_ENV` และ `PUBLIC_URL` เป็นค่าที่ Create React App จัดการเอง ไม่ต้องใส่ใน `.env` ของ backend และห้าม commit `.env` เพราะมีข้อมูลเชื่อมต่อฐานข้อมูล

## ติดตั้งและรัน

```powershell
npm ci
npm run dev
```

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5001](http://localhost:5001)
- MongoDB Compass ใช้ค่า `MONGODB_URI` เดียวกับ backend

### สร้างบัญชี Admin คนแรก

ระบบไม่มีหน้าสมัครสมาชิก บัญชีทั้งหมดสร้างโดย Admin ดังนั้นต้องสร้าง Admin คนแรกจาก command line:

```powershell
npm run create-admin -- <username> "<ชื่อ-นามสกุล>" <รหัสพนักงาน> [password]
```

ถ้าไม่ระบุ password ระบบจะสร้างรหัสที่ปลอดภัยและแสดงเพียงครั้งเดียว

## คำสั่งตรวจสอบ

```powershell
npm test
npm run test:client
npm run build
```

## โครงสร้างสำคัญ

- `server.js` จุดเริ่มต้น backend
- `router/api` API สำหรับ auth, users, courses และการลงทะเบียน
- `model` Mongoose models
- `front-knowledge` React frontend และ npm workspace
- `E_LEARNING_DESIGN_PLAN.md` แผนและขอบเขตระบบ
