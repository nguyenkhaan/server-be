# Cach cai dat so do du an chuan chinh 
- Quan trong nhat la file tsconfig.json, file nay copy ve de su dung 
- File prisma.config.ts, o phan defineConfig, them truong schema chua duong dan den thu muc tap hop, chua tat ca cac file prisma 
```ts
export default defineConfig({
  schema: join(__dirname, 'prisma', 'models'),
  migrations: {
    seed: "bun prisma/seed/index.ts", 
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});

```
- Khong bien dich code ra js de chay => File package.json thay nest dev tro thanh bun src/main.ts vi bun ho tro chay code ma khong can bien dich 


Thuc te ve guard, chung ta chi can gi 
jwt-strategy: Dinh nghia strategy de verify access-token 
jwt-auth-guard: Tao guard de verify token gui ve 

local-strategy: Dung de tao ra guard email va password khi nguoi dung dang nhap 
local-auth.guard: Tao ra guard de verify khi nguoi dung dang nhap 

