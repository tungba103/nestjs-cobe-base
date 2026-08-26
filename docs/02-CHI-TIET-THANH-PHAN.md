# Chi tiết từng thành phần

> Với **mỗi** thành phần, tài liệu trả lời 4 câu hỏi:
> **① Nó là gì?** → **② Tại sao cần nó?** → **③ Codebase này đang dùng ra sao?** → **④ Ưu & nhược điểm.**
>
> Nên đọc [`01-TONG-QUAN.md`](./01-TONG-QUAN.md) trước để có bức tranh lớn.
> File này dùng để **tra cứu**: gặp khái niệm lạ trong code thì mở ra tìm, không nhất thiết đọc một mạch.

## Mục lục

**Phần A — Nền tảng**
1. [Node.js](#1-nodejs)
2. [package.json, yarn, node_modules](#2-packagejson-yarn-node_modules)
3. [TypeScript & tsconfig.json](#3-typescript--tsconfigjson)
4. [Path alias (`@n-*`)](#4-path-alias-n-)

**Phần B — Bộ khung NestJS**
5. [NestJS là gì](#5-nestjs-là-gì)
6. [Decorator (`@...`)](#6-decorator-)
7. [Module](#7-module)
8. [Dependency Injection](#8-dependency-injection-di)
9. [Controller](#9-controller)
10. [Service](#10-service)

**Phần C — Tầng dữ liệu**
11. [Prisma & ORM](#11-prisma--orm)
12. [schema.prisma](#12-schemaprisma)
13. [Migration](#13-migration)
14. [Seed](#14-seed)
15. [PrismaService](#15-prismaservice)
16. [Transaction](#16-transaction)

**Phần D — Dữ liệu vào/ra**
17. [DTO](#17-dto-data-transfer-object)
18. [class-validator & class-transformer](#18-class-validator--class-transformer)
19. [Pipe & ValidationPipe](#19-pipe--validationpipe)

**Phần E — Đường đi của request**
20. [Middleware](#20-middleware)
21. [Guard](#21-guard)
22. [JWT & xác thực](#22-jwt--xác-thực)
23. [Phân quyền & Reflector](#23-phân-quyền--reflector)
24. [Decorator tự viết](#24-decorator-tự-viết)
25. [Interceptor](#25-interceptor)
26. [Exception Filter](#26-exception-filter)
27. [Thứ tự thực thi đầy đủ](#27-thứ-tự-thực-thi-đầy-đủ)

**Phần F — Quy ước trong dự án**
28. [Pattern phân trang](#28-pattern-phân-trang)
29. [Soft delete (`isActive`)](#29-soft-delete-isactive)
30. [Bố cục service](#30-bố-cục-service)

**Phần G — Công cụ**
31. [Docker & docker-compose](#31-docker--docker-compose)
32. [Biến môi trường (.env)](#32-biến-môi-trường-env)
33. [Swagger](#33-swagger)
34. [ESLint & Prettier](#34-eslint--prettier)
35. [Jest](#35-jest)
36. [bcrypt](#36-bcrypt)

---
---

# Phần A — Nền tảng

## 1. Node.js

### ① Nó là gì?

JavaScript sinh ra để chạy trong trình duyệt. **Node.js** là chương trình lấy bộ máy JavaScript của
Chrome (V8) đem ra ngoài, cho phép chạy file `.js` trực tiếp trên máy tính/máy chủ — và cho nó thêm
quyền đọc/ghi file, mở kết nối mạng, nghe cổng.

### ② Tại sao cần?

Không có Node.js thì JavaScript không thể làm backend. Có Node.js, cả frontend lẫn backend cùng
dùng một ngôn ngữ — một lập trình viên có thể làm cả hai đầu.

Đặc điểm quan trọng nhất của Node: **một luồng (single-thread) + bất đồng bộ (asynchronous)**.
Hãy hình dung một nhân viên phục vụ duy nhất trong quán ăn: anh ta nhận order bàn 1, chuyển bếp,
rồi **không đứng đợi** mà đi nhận order bàn 2, bàn 3. Món nào xong thì bưng ra.
Nhờ vậy một tiến trình Node phục vụ được hàng nghìn request cùng lúc, miễn là các request chủ yếu
"chờ" (chờ DB, chờ mạng) chứ không "tính toán nặng".

Đó là lý do trong codebase này chỗ nào gọi DB cũng có `await`:

```ts
const existingCustomer = await this.prismaService.customer.findFirst({ ... });
```

`await` = "tạm dừng hàm này, nhường CPU cho request khác, khi DB trả lời thì quay lại đây".

### ③ Codebase này dùng ra sao?

- Yêu cầu **Node.js 20** (`Dockerfile` ghi rõ `FROM node:20.16.0`).
- Điểm khởi động: `src/main.ts`.
- Kiểu module: `commonjs` (dùng `import`/`export` của TypeScript rồi biên dịch xuống `require`).

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Cùng ngôn ngữ cho FE và BE | Không hợp việc tính toán nặng (xử lý ảnh, mã hoá lớn) — sẽ chặn cả tiến trình |
| Hệ sinh thái thư viện khổng lồ (npm) | Bất đồng bộ khiến người mới dễ nhầm (quên `await` → nhận về `Promise` rỗng) |
| Xử lý rất tốt các tác vụ chờ I/O (DB, API) | Chỉ dùng được 1 CPU core cho mỗi tiến trình |

---

## 2. package.json, yarn, node_modules

### ① Nó là gì?

- **`package.json`**: "chứng minh thư" của dự án. Ghi tên, phiên bản, **danh sách thư viện cần dùng**
  và **các lệnh tắt**.
- **`yarn`**: công cụ tải thư viện về (giống `npm`, nhanh hơn chút).
- **`node_modules/`**: nơi chứa code thư viện đã tải. Rất nặng (hàng trăm MB), **không commit lên git**.
- **`yarn.lock`**: khoá chính xác phiên bản từng thư viện. **Phải commit** — để máy bạn và máy đồng
  nghiệp cài ra kết quả giống hệt nhau.

### ② Tại sao cần?

Không ai tự viết lại mọi thứ. Cần đọc HTTP → dùng Express. Cần mã hoá mật khẩu → dùng bcrypt.
`package.json` là bản kê khai để bất kỳ ai clone repo về chỉ cần gõ `yarn install` là có đủ.

Cần `yarn.lock` vì `"^10.0.0"` nghĩa là "10.x.x bất kỳ". Không khoá lại thì hôm nay bạn cài được
10.0.0, tháng sau đồng nghiệp cài ra 10.4.7 và lỗi lạ xuất hiện — kinh điển là câu
"nhưng máy tôi chạy được mà".

### ③ Codebase này dùng ra sao?

Các thư viện chính và vai trò:

| Thư viện | Vai trò |
|---|---|
| `@nestjs/common`, `@nestjs/core` | Lõi framework NestJS |
| `@nestjs/platform-express` | NestJS chạy trên nền Express (thư viện HTTP phổ biến nhất của Node) |
| `@prisma/client`, `prisma` | Nói chuyện với PostgreSQL |
| `@nestjs/jwt`, `passport`, `passport-jwt` | Tạo & kiểm tra token đăng nhập |
| `bcrypt` | Băm mật khẩu |
| `class-validator`, `class-transformer` | Kiểm tra & chuyển đổi dữ liệu đầu vào |
| `@nestjs/swagger` | Tự sinh trang tài liệu API |
| `winston` | Ghi log ra file (khai báo ở `utils/logger-factory.util.ts` nhưng **hiện chưa được dùng ở đâu**) |
| `colorette` | Tô màu chữ trong terminal |

Các lệnh tắt (chạy bằng `yarn <tên>`):

```jsonc
"start:dev": "nodemon",     // chạy dev, tự restart khi sửa file trong src/
"build":     "nest build",  // biên dịch TS → JS vào thư mục dist/
"start:prod":"node dist/main",
"lint":      "eslint ... --fix",
"format":    "prettier --write ...",
"test":      "jest"
```

`nodemon` được cấu hình ngay trong `package.json`:

```jsonc
"nodemonConfig": {
  "watch": ["src"],                                    // ⚠️ chỉ theo dõi src/
  "exec": "ts-node --transpile-only ... ./src/main.ts" // ⚠️ transpile-only
}
```

Hai chữ ⚠️ đó rất quan trọng:
- Chỉ theo dõi `src/` → sửa `prisma/schema.prisma` **không** làm server restart.
- `--transpile-only` = xoá kiểu TypeScript đi rồi chạy, **bỏ qua kiểm tra kiểu** để khởi động nhanh.
  Nghĩa là code sai kiểu vẫn chạy dev bình thường và chỉ nổ khi `yarn build`. **Luôn chạy
  `yarn build` trước khi push.**

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Cài đủ môi trường chỉ với 1 lệnh | `node_modules` cực nặng |
| `yarn.lock` đảm bảo mọi máy giống nhau | Phụ thuộc rất nhiều thư viện của người lạ (rủi ro bảo mật) |
| Lệnh tắt giúp cả team gõ giống nhau | Dev mode bỏ qua kiểm tra kiểu → dễ đẩy code lỗi lên |

---

## 3. TypeScript & tsconfig.json

### ① Nó là gì?

**TypeScript (TS)** = JavaScript + hệ thống kiểu. Bạn khai báo trước "biến này là chuỗi, hàm này
trả về số", trình biên dịch sẽ báo lỗi ngay khi bạn viết sai — trước cả khi chạy.

```ts
// JavaScript: sai vẫn chạy, đến lúc chạy mới sập
function tinhTien(gia, soLuong) { return gia * soLuong; }
tinhTien("mười", 2);   // → NaN, không ai báo gì cả

// TypeScript: báo đỏ ngay trong editor
function tinhTien(gia: number, soLuong: number): number { return gia * soLuong; }
tinhTien("mười", 2);   // ❌ Argument of type 'string' is not assignable to parameter of type 'number'
```

Trình duyệt và Node **không hiểu** TypeScript. Phải **biên dịch** (`yarn build`) thành `.js` trong
thư mục `dist/` rồi mới chạy được.

### ② Tại sao cần?

1. **Bắt lỗi sớm.** Gõ sai tên trường (`custmer.name`) là biết ngay, không đợi khách hàng báo lỗi.
2. **Editor gợi ý.** Gõ `this.prismaService.` là VS Code xổ ra toàn bộ danh sách bảng — vì Prisma
   sinh sẵn kiểu. Đây là lợi ích lớn nhất với người mới: bạn **không cần nhớ**, editor nhắc hộ.
3. **Tài liệu sống.** Nhìn `create(dto: CreateCustomerDto)` là biết ngay phải truyền gì vào.
4. **NestJS bắt buộc.** Cơ chế Dependency Injection của Nest dựa hoàn toàn vào kiểu dữ liệu để biết
   phải tiêm cái gì (mục 8).

### ③ Codebase này dùng ra sao?

`tsconfig.json` có vài lựa chọn đáng chú ý:

```jsonc
{
  "target": "ES2021",
  "module": "commonjs",
  "experimentalDecorators": true,   // ⭐ bật cú pháp @Decorator
  "emitDecoratorMetadata": true,    // ⭐ ghi thông tin KIỂU vào file js đã biên dịch → DI hoạt động được
  "baseUrl": "./src",               // gốc để tính đường dẫn import
  "outDir": "./dist",

  "strictNullChecks": false,        // ⚠️
  "noImplicitAny": false            // ⚠️
}
```

Hai dòng ⚠️ cuối làm **giảm** sức mạnh của TypeScript:

- `strictNullChecks: false` → TS **không** cảnh báo khi bạn dùng giá trị có thể `null`. Đây chính là
  nguồn gốc lỗi `Cannot read property 'x' of null` lúc chạy. Ví dụ thật trong
  `visits.service.ts`:
  ```ts
  const { prescriptionItems, ...prescriptionData } = prescription;
  ```
  `prescription` là trường **optional** trong DTO. Nếu frontend không gửi `prescription`, dòng này
  nổ ngay lập tức. Bật `strictNullChecks` thì TS đã bắt bạn kiểm tra trước rồi.
- `noImplicitAny: false` → biến không khai kiểu sẽ mặc định là `any` (= "kiểu gì cũng được", tắt hết
  kiểm tra). Ví dụ `convertTextToCode(text)` trong `utils/common.util.ts` không ghi kiểu cho `text`.

Vì sao lại tắt? Vì bật lên thì code cũ sẽ báo hàng trăm lỗi. Đây là đánh đổi thường gặp: dễ viết
lúc đầu, trả giá về sau. **Với code mới, bạn nên tự giác khai báo kiểu đầy đủ.**

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Bắt lỗi lúc viết thay vì lúc chạy | Phải biên dịch, chậm hơn JS thuần |
| Editor tự động gợi ý — cực hợp người mới | Phải học thêm cú pháp kiểu |
| Refactor an toàn (đổi tên trường → báo mọi chỗ hỏng) | Cấu hình lỏng (như dự án này) thì mất phần lớn lợi ích |

---

## 4. Path alias (`@n-*`)

### ① Nó là gì?

Đường dẫn tắt khi import, khai báo trong `tsconfig.json`:

```jsonc
"baseUrl": "./src",
"paths": {
  "@n-constants":       ["constants/index.ts"],
  "@n-decorators":      ["decorators/index.ts"],
  "@n-dtos":            ["dtos/index.ts"],
  "@n-guards":          ["guards/index.ts"],
  "@n-interceptors":    ["interceptors/index.ts"],
  "@n-middlewares":     ["middlewares/index.ts"],
  "@n-models":          ["models/index.ts"],
  "@n-utils":           ["utils/index.ts"],
  "@n-filter-exceptions": ["filter-exceptions/index.ts"]
}
```

### ② Tại sao cần?

So sánh hai cách viết cùng một import từ file `src/modules/customers/dto/filter-customer.dto.ts`:

```ts
import { PaginationWithSearchParamsDto } from '../../../dtos/pagination-params.dto'; // ❌ đếm mỏi mắt
import { PaginationWithSearchParamsDto } from '@n-dtos';                             // ✅
```

Cách thứ nhất còn **hỏng ngay** khi bạn di chuyển file sang thư mục khác. Cách thứ hai thì không.

Mỗi alias trỏ tới một file `index.ts` chỉ làm nhiệm vụ gom hàng:

```ts
// src/utils/index.ts
export * from './common.util';
export * from './logger-factory.util';
```

Nhờ vậy bên ngoài chỉ cần nhớ **một** tên `@n-utils` thay vì nhớ từng file con.

### ③ Codebase này dùng ra sao? — và 2 cái bẫy

**Bẫy 1: hai alias đã chết.**

```jsonc
"@n-config":  ["config/index.ts"],    // ❌ thư mục thật tên là configs/ (có s)
"@n-modules": ["modules/index.ts"]    // ❌ file này không tồn tại
```

Dùng hai alias này sẽ lỗi. Đừng dùng.

**Bẫy 2: code trộn 2 phong cách.** Vì `baseUrl` là `./src`, ta còn import được theo đường dẫn
tính từ `src/`, không cần alias:

```ts
import { PrismaService } from 'prisma/prisma.service';  // = src/prisma/prisma.service
import { makePaginationResponse } from 'utils';          // = src/utils/index.ts
```

Cách viết `'prisma/prisma.service'` gây hiểu nhầm nghiêm trọng: nhìn tưởng là thư mục `prisma/` ở
gốc dự án (chỗ chứa `schema.prisma`), thực ra là `src/prisma/`. Đây là import xuất hiện ở **mọi**
service, nên cần nhớ kỹ.

> **Khuyến nghị cho code mới**: ưu tiên `@n-*`. Riêng `PrismaService` chưa có alias nên cứ theo
> nếp cũ dùng `'prisma/prisma.service'` cho đồng nhất.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Import ngắn, dễ đọc | Phải cấu hình ở nhiều nơi (`tsconfig`, jest, `tsconfig-paths` lúc chạy) |
| Di chuyển file không vỡ import | Alias sai/chết vẫn nằm đó, người mới thử là dính lỗi |
| `index.ts` gom đầu mối gọn gàng | Trộn nhiều phong cách import trong cùng repo gây rối |

---
---

# Phần B — Bộ khung NestJS

## 5. NestJS là gì

### ① Nó là gì?

Một **framework** backend cho Node.js. Nó không thay thế Express mà **bọc bên ngoài** Express, thêm
vào: cấu trúc thư mục bắt buộc, Dependency Injection, và hệ thống decorator.

So sánh trực tiếp cùng một việc:

```ts
// Express thuần — tự do, nhưng mỗi người viết một kiểu
const express = require('express');
const app = express();
app.get('/customers', async (req, res) => {
  const page = parseInt(req.query.page) || 1;       // tự parse
  if (page < 1) return res.status(400).json({...}); // tự kiểm tra
  const data = await db.query('SELECT ...');        // tự viết SQL
  res.json({ data });                               // tự định dạng
});
```

```ts
// NestJS — khuôn mẫu rõ ràng, việc lặp lại đã có framework lo
@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get()
  findAll(@Query() filter: FilterCustomerDto) {      // tự parse + tự kiểm tra qua DTO
    return this.customersService.getListCustomers(filter);
  }
}
```

### ② Tại sao cần?

Express cho bạn tự do tuyệt đối — đó vừa là ưu vừa là nhược. Dự án 5 file thì tự do là tốt. Dự án
80 file với 5 người làm thì tự do = mỗi người một kiểu = không ai đọc nổi code của ai.

NestJS áp đặt một khuôn: *"Route để trong Controller. Logic để trong Service. Kiểm tra dữ liệu để
trong DTO. Gom lại bằng Module."* Nhờ vậy, mở bất kỳ module nào trong dự án này bạn cũng thấy đúng
4 file với đúng vai trò đó — học một lần, dùng mọi nơi.

### ③ Codebase này dùng ra sao?

`src/main.ts` là nơi khởi động, chỉ ~50 dòng nhưng quyết định hành vi toàn app:

```ts
const PORT = 9100;                    // ⚠️ ghi cứng, không đọc từ .env
const GLOBAL_PREFIX = 'api/v1';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);   // dựng app từ module gốc

  app.enableCors({                                   // ⚠️ danh sách ghi cứng
    origin: ['http://localhost:5173', 'https://lovable-frontend-clinic.vercel.app'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));  // bật kiểm tra DTO toàn cục
  app.setGlobalPrefix(GLOBAL_PREFIX);                           // mọi URL thêm /api/v1
  setupOpenApi(app);                                            // bật Swagger tại /swagger

  await app.listen(PORT);
}
```

**CORS** là gì? Trình duyệt cấm trang web ở tên miền A gọi API ở tên miền B, trừ khi B nói "tôi cho
phép A". `enableCors` chính là câu cho phép đó. Frontend chạy ở cổng khác (5173) nên bắt buộc phải có.
Hệ quả: chạy frontend ở cổng khác 5173 sẽ bị trình duyệt chặn cho tới khi bạn thêm địa chỉ vào danh sách này.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Cấu trúc thống nhất, người mới vào đọc được ngay | Học nhiều khái niệm cùng lúc (module, DI, decorator...) |
| Sẵn DI, validation, Swagger, guard, interceptor | Nhiều file "thủ tục" cho một tính năng nhỏ |
| Hợp dự án vừa & lớn, nhiều người | Nặng nề nếu chỉ cần API 3 route |
| TypeScript là công dân hạng nhất | Lỗi DI (`Nest can't resolve dependencies`) khó hiểu với người mới |

---

## 6. Decorator (`@...`)

### ① Nó là gì?

Decorator là **một hàm**, viết dưới dạng `@TenHam`, đặt ngay trên class / phương thức / thuộc tính /
tham số để **gắn thêm thông tin (metadata)** hoặc **thay đổi hành vi** của nó.

Chúng chỉ là cú pháp cho một việc rất đời thường: **dán nhãn**. Bản thân cái nhãn không làm gì cả —
nó chỉ có ý nghĩa khi có ai đó đọc nhãn. Ở đây "ai đó" là NestJS.

```ts
@Controller('customers')          // nhãn trên CLASS:      "class này xử lý URL /customers"
export class CustomersController {

  @Get(':id')                     // nhãn trên PHƯƠNG THỨC: "hàm này chạy khi GET /customers/:id"
  findOne(@Param('id') id: string) {   // nhãn trên THAM SỐ: "lấy phần :id trên URL đưa vào đây"
    return this.customersService.findOne(+id);
  }
}
```

Không có decorator, bạn phải tự đăng ký thủ công từng route. Có decorator, NestJS lúc khởi động sẽ
quét toàn bộ class, đọc nhãn, và tự dựng bảng định tuyến.

### ② Tại sao cần?

Cùng một thông tin, so sánh cách khai báo:

```ts
// Không decorator: cấu hình tách rời khỏi code → dễ quên đồng bộ
router.get('/customers/:id', requireAuth, requirePermission('GET_CUSTOMER'), ctrl.findOne);

// Có decorator: cấu hình nằm NGAY TRÊN hàm nó mô tả → nhìn là hiểu
@Get(':id')
@Permissions(PermissionNameType.GET_CUSTOMER)
findOne(@Param('id') id: string) { ... }
```

Decorator đặt mọi thứ liên quan tới một hàm ở ngay cạnh hàm đó.

### ③ Codebase này dùng ra sao?

| Nhóm | Decorator | Ý nghĩa |
|---|---|---|
| Định tuyến | `@Controller('customers')` | tiền tố URL cho cả class |
| | `@Get()` `@Post()` `@Patch()` `@Delete()` | HTTP method + đường dẫn con |
| Lấy dữ liệu | `@Body()` | lấy body JSON |
| | `@Param('id')` | lấy `:id` trên URL |
| | `@Query()` | lấy `?page=1&search=x` |
| | `@Req()` | lấy nguyên request (dùng để đọc `req.user`) |
| DI | `@Injectable()` | "class này có thể được tiêm đi nơi khác" |
| | `@Module({...})` | khai báo một module |
| Kiểm tra dữ liệu | `@IsString()` `@IsNotEmpty()` `@IsOptional()` `@IsEnum()` `@Min()` `@Max()` | luật hợp lệ cho từng trường DTO |
| | `@Transform(...)` `@Type(...)` | chuyển đổi kiểu dữ liệu |
| Tài liệu | `@ApiTags()` `@ApiProperty()` `@ApiBearerAuth()` | dữ liệu cho trang Swagger |
| Tự viết | `@AuthClaims()` `@Permissions(...)` | xem mục 24 |

Trong `src/modules/visits/dto/prescription.dto.ts` bạn thấy nhiều nhãn chồng lên nhau — đọc **từ
dưới lên** như tính từ bổ nghĩa cho `quantity`:

```ts
@IsNumber()                         // phải là số
@ApiProperty({ example: 2 })        // Swagger hiện ví dụ "2"
quantity: number;
```

⚠️ Để decorator hoạt động, `tsconfig.json` phải bật `experimentalDecorators` **và**
`emitDecoratorMetadata`. Cả hai đều đã bật.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Cấu hình nằm ngay cạnh code nó mô tả | "Ma thuật ẩn" — người mới không thấy được cái gì đang chạy |
| Rất gọn, ít code lặp | Khó gỡ lỗi: đặt breakpoint vào đâu? |
| Tái sử dụng dễ (gộp nhiều nhãn thành một) | Phụ thuộc cấu hình TS; thiếu 1 dòng config là hỏng toàn bộ |
| | Vẫn là tính năng thử nghiệm của TS (`experimentalDecorators`) |

---

## 7. Module

### ① Nó là gì?

Cái hộp gom nhóm code cùng một chủ đề, khai báo bằng `@Module({...})` với 4 ô:

```ts
@Module({
  imports:     [PrismaModule],           // module KHÁC mà tôi cần dùng
  controllers: [CustomersController],    // controller của tôi
  providers:   [CustomersService],       // service của tôi (Nest được phép tạo & tiêm)
  exports:     [CustomersService],       // cái tôi cho module khác mượn
})
export class CustomersModule {}
```

Ví von: mỗi module là một **phòng ban**.
`providers` = nhân viên trong phòng. `exports` = nhân viên được phép cho phòng khác mượn.
`imports` = danh sách phòng ban khác mà tôi cần hợp tác.

**Quy tắc then chốt**: bạn chỉ dùng được service của module khác nếu module đó `exports` nó
**và** module của bạn `imports` module đó. Đây là nguyên nhân số 1 của lỗi
`Nest can't resolve dependencies of ...`.

### ② Tại sao cần?

1. **Ranh giới rõ ràng.** Muốn sửa nghiệp vụ khách hàng → vào đúng `modules/customers/`.
2. **Kiểm soát truy cập.** Không phải service nào cũng cho cả app dùng bừa.
3. **Nạp có tổ chức.** Nest đọc cây module để biết thứ tự khởi tạo mọi thứ.

### ③ Codebase này dùng ra sao?

`src/app.module.ts` là gốc của cây:

```ts
@Module({
  imports: [
    JwtModule.registerAsync(JwtOptions),   // cấu hình JWT, đặt global: true
    PrismaModule,
    AuthModule, UsersModule, RolesModule,
    CustomersModule, VisitsModule, ProductsModule, ServicesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },  // ⭐ áp dụng TOÀN CỤC
    { provide: APP_FILTER,      useClass: AllExceptionFilter },   // ⭐ áp dụng TOÀN CỤC
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');   // middleware cho mọi route
  }
}
```

Cú pháp `{ provide: APP_INTERCEPTOR, useClass: ... }` là cách nói với Nest:
*"đừng chỉ đăng ký class này, hãy gắn nó vào MỌI route của app"*. Đó chính là lý do mọi response
trong dự án đều có phong bì `{message, statusCode, result}` mà bạn không phải làm gì.

Vài quan sát về cách tổ chức module ở đây:

- Hầu hết module đều `imports: [PrismaModule]` để dùng `PrismaService`.
- **`AuthModule` làm khác:** nó không import `PrismaModule` mà khai trực tiếp
  `providers: [AuthService, PrismaService, UsersService]`. Nghĩa là nó tự tạo **bản sao riêng** của
  `PrismaService` và `UsersService`, thay vì dùng chung. Chạy vẫn được, nhưng có 2 kết nối DB thay
  vì 1 — không tối ưu và không nhất quán với phần còn lại của codebase. Nên sửa thành
  `imports: [PrismaModule, UsersModule]`.
- **`ProductsModule` chứa 2 bộ controller/service** (`Products` và `ProductCategories`) vì hai chủ
  đề gắn bó chặt. `ServicesModule` cũng vậy. Đây là lựa chọn hợp lý.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Code gom nhóm rõ ràng theo nghiệp vụ | Thêm 1 tầng khai báo — người mới hay quên đăng ký |
| Kiểm soát được cái gì lộ ra ngoài | Lỗi DI khó đọc, chỉ ra module chứ không chỉ ra dòng |
| Dễ tách thành microservice sau này | Import vòng tròn (A cần B, B cần A) là bài toán khó gỡ |

---

## 8. Dependency Injection (DI)

> Đây là khái niệm **khó nhất** với người mới, và cũng là thứ khiến NestJS là NestJS. Hãy đọc chậm.

### ① Nó là gì?

Bình thường, muốn dùng một class thì bạn tự tạo nó:

```ts
class CustomersService {
  private prisma = new PrismaService();   // TỰ tạo
}
```

Với DI thì **ngược lại**: bạn chỉ *khai báo là mình cần*, còn framework lo việc tạo và đưa vào:

```ts
@Injectable()
export class CustomersService {
  constructor(private prismaService: PrismaService) {}   // chỉ KHAI BÁO "tôi cần cái này"
  //          └─────────┬──────────────────────────┘
  //          NestJS đọc kiểu `PrismaService`, tự tìm/tạo instance, tự truyền vào
}
```

Từ `private` trong constructor là cú pháp tắt của TypeScript. Nó tương đương với:

```ts
constructor(prismaService: PrismaService) {
  this.prismaService = prismaService;   // TS tự sinh dòng này cho bạn
}
```

Nên trong các phương thức khác bạn dùng được ngay `this.prismaService`.

### ② Tại sao cần?

**Lý do 1 — Dùng chung một instance (quan trọng nhất ở đây).**
`PrismaService` mở một *connection pool* tới PostgreSQL. Nếu 8 service mỗi anh `new PrismaService()`
thì có 8 pool → tốn tài nguyên, có thể vượt giới hạn kết nối của Postgres. Với DI, Nest tạo **đúng
một** instance (gọi là *singleton*) rồi đưa cùng một object đó cho tất cả.

**Lý do 2 — Không phải tự lắp ráp thủ công.**
`AuthService` cần `JwtService`, `PrismaService` và `UsersService`; `UsersService` lại cần
`PrismaService`... Không có DI bạn phải tự viết chuỗi lắp ráp đúng thứ tự. Có DI, Nest đọc cây phụ
thuộc và tự lắp.

**Lý do 3 — Dễ viết test.**
Khi test `CustomersService`, bạn có thể truyền vào một `PrismaService` **giả** trả về dữ liệu định
sẵn, không cần database thật. Điều này bất khả thi nếu service tự `new` bên trong.

### ③ Codebase này dùng ra sao?

Xem `AuthService` — tiêm 3 thứ cùng lúc:

```ts
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,      // từ JwtModule (đã đặt global: true → dùng ở đâu cũng được)
    private prisma: PrismaService,       // từ providers của AuthModule
    private usersService: UsersService,  // từ providers của AuthModule
  ) {}
}
```

Để một class được tiêm, cần **đủ 3 điều kiện**:

1. Class có `@Injectable()`.
2. Class nằm trong `providers` của một module (hoặc module đó `exports` và bạn `imports`).
3. `emitDecoratorMetadata: true` trong `tsconfig.json` — vì sau khi biên dịch sang JS, thông tin
   kiểu bị xoá mất; tuỳ chọn này ghi kiểu vào metadata để Nest lúc chạy vẫn "nhìn" thấy
   `PrismaService`.

**Cách đọc lỗi DI.** Thông báo kinh điển:

```
Nest can't resolve dependencies of the CustomersService (?).
Please make sure that the argument PrismaService at index [0] is available in the CustomersModule context.
```

Dịch: *"`CustomersService` xin `PrismaService` ở vị trí tham số thứ 0, nhưng trong
`CustomersModule` không có ai cung cấp."* Cách sửa: thêm `PrismaModule` vào `imports`, hoặc kiểm tra
module kia đã `exports` chưa.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Dùng chung instance → tiết kiệm tài nguyên (1 pool DB) | Khái niệm trừu tượng, khó với người mới |
| Không phải tự lắp ráp phụ thuộc | Lỗi xảy ra lúc chạy, không phải lúc biên dịch |
| Thay thế bằng bản giả để test rất dễ | Khó lần theo: một object được tạo ở đâu? |
| Ràng buộc lỏng, dễ thay đổi triển khai | Import vòng tròn phải xử lý bằng `forwardRef()` |

---

## 9. Controller

### ① Nó là gì?

Lớp **ngoài cùng** của ứng dụng — nơi HTTP chạm vào code của bạn. Nhiệm vụ duy nhất: ánh xạ
`(method + URL)` → một hàm, rút dữ liệu ra khỏi request, rồi giao cho service.

### ② Tại sao cần?

Để **tách biệt "cách giao tiếp" khỏi "nghiệp vụ"**. Logic "không cho tạo khách hàng trùng SĐT"
là luật của phòng khám — nó đúng dù bạn gọi qua HTTP, qua dòng lệnh, hay qua hàng đợi tin nhắn.
Vì vậy luật đó phải nằm trong Service. Controller chỉ là *một* cánh cửa dẫn vào.

Nếu mai này cần thêm giao diện dòng lệnh, bạn viết lớp vỏ mới gọi cùng service — không phải chép
lại logic.

### ③ Codebase này dùng ra sao?

Mọi controller đều theo đúng khuôn này:

```ts
@Controller('customers')     // (1) tiền tố URL
@ApiTags('Customer')         // (2) nhóm trong Swagger
@AuthClaims()                // (3) bắt đăng nhập + kiểm quyền cho TOÀN BỘ class
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}   // (4) DI

  @Post()
  @Permissions(PermissionNameType.CREATE_CUSTOMER)                      // (5) quyền cụ thể
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);             // (6) uỷ quyền, 1 dòng
  }

  @Get(':id')
  @Permissions(PermissionNameType.GET_CUSTOMER)
  findOne(@Param('id') id: string) {
    return this.customersService.findOne(+id);                          // (7) dấu + đổi chuỗi → số
  }
}
```

Vài điểm đáng chú ý:

- **`+id`** — tham số URL **luôn** là chuỗi (`"5"`), nhưng DB cần số (`5`). `+id` là cách viết tắt
  của `Number(id)`. Nếu quên, Prisma sẽ báo lỗi kiểu.
- **Không có `async/await`.** Các hàm này `return` thẳng Promise từ service. NestJS tự `await` hộ.
  Viết `async` + `await` cũng đúng, chỉ là dài hơn.
- **`@AuthClaims()` đặt trên class** → áp dụng cho mọi hàm bên trong. `AuthController` cố tình
  **không** có nó (nếu có thì không ai đăng nhập được vì chưa có token), mà chỉ gắn riêng cho
  `logout`.
- **`VisitsController` không có `@Permissions`** ở bất kỳ hàm nào → nghĩa là ai đăng nhập cũng
  thao tác được lượt khám. Đây là điểm khác biệt có chủ ý hay bị bỏ sót thì cần hỏi lại team.
- **Đọc user đang đăng nhập** — `VisitsController` lấy từ `@Req()`:
  ```ts
  @Post()
  create(@Req() req, @Body() createVisitDto: CreateVisitDto) {
    const { id, name } = req.user;    // do JwtAuthGuard gắn vào ở bước trước
    return this.visitsService.create({ id, name }, createVisitDto);
  }
  ```
  `req.user` có được là nhờ `JwtAuthGuard` đã chạy trước và gán vào (mục 22).

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Nhìn 1 file là biết resource có những API nào | Thêm 1 tầng trung gian, với API siêu đơn giản thì hơi thừa |
| Đổi HTTP sang giao thức khác không ảnh hưởng logic | Người mới hay bị cám dỗ nhét logic vào controller |
| Decorator làm route rất dễ đọc | Ép kiểu thủ công (`+id`) dễ quên |

---

## 10. Service

### ① Nó là gì?

Nơi chứa **toàn bộ** nghiệp vụ: kiểm tra luật, tính toán, gọi database. Đánh dấu bằng `@Injectable()`
để DI tiêm được vào controller.

### ② Tại sao cần?

- **Tái sử dụng.** `UsersService.findByUsername()` được cả `UsersController` lẫn `AuthService` dùng.
  Nếu logic nằm trong controller thì phải chép đôi.
- **Test được.** Test service không cần dựng cả một server HTTP.
- **Một nguồn sự thật.** Luật "không cho khách hàng trùng" chỉ viết một chỗ.

### ③ Codebase này dùng ra sao?

Mọi service tuân theo **cùng một bố cục** (xem thêm mục 30):

```ts
@Injectable()
export class ProductsService {
  constructor(private prismaService: PrismaService) {}

  // ---- Nhóm 1: các use-case công khai, khớp 1-1 với hàm trong controller ----
  async create(dto: CreateProductDto) { ... }
  async getListProducts(filter: FilterProductDto) { ... }
  findOne(id: number) { ... }
  async update(id: number, dto: UpdateProductDto) { ... }

  // ---- Nhóm 2: các hàm truy vấn thuần ----
  // (một số service ghi rõ bằng comment "// Repository methods")
  findAll(filter) { ... }
  count(filter) { ... }
}
```

Ví dụ đầy đủ về "luật nghiệp vụ" — `ProductsService.create`:

```ts
async create(createProductDto: CreateProductDto) {
  const code = convertTextToCode(createProductDto.name);      // "Thuốc Ho" → "ThuocHo"

  const existingProduct = await this.prismaService.product.findUnique({ where: { code } });
  if (existingProduct) {
    throw new BadRequestException('Product code already exists');   // → filter biến thành HTTP 400
  }

  return this.prismaService.product.create({ data: { ...createProductDto, code } });
}
```

Ở đây có 3 kỹ thuật đáng học:

1. **`convertTextToCode`** (trong `utils/common.util.ts`) bỏ dấu tiếng Việt và khoảng trắng để sinh
   mã định danh. Đây là hàm dùng chung, đặt ở `utils/` chứ không chép vào từng service.
2. **`throw new BadRequestException(...)`** — không cần `return res.status(400)`. Cứ ném lỗi ra,
   Exception Filter toàn cục sẽ dịch thành response chuẩn (mục 26). NestJS có sẵn
   `NotFoundException` (404), `UnauthorizedException` (401), `ForbiddenException` (403),
   `InternalServerErrorException` (500)...
3. **`{ ...createProductDto, code }`** — cú pháp *spread*: sao chép mọi trường của DTO rồi thêm/ghi
   đè `code`. Rất phổ biến trong codebase này.

**Điểm cần cải thiện (đọc code có phê phán):**

- **Trùng lặp `where`.** Trong `ProductsService`, khối `where` của `findAll` và `count` giống hệt
  nhau nhưng bị chép đôi. `RolesService` làm đúng hơn: tách ra hàm riêng `private whereCondition(filter)`
  rồi cả hai cùng gọi. Hãy theo cách của `RolesService`.
- **Lỗ hổng SQL Injection trong `CustomersService.findAll`.** Đây là vấn đề **bảo mật thật sự**:
  ```ts
  const searchCondition = search
    ? `AND (LOWER(c.name) LIKE LOWER('%${search}%') ...)`   // ❌ nhét thẳng chuỗi người dùng vào SQL
    : '';
  const query = `SELECT c.*, MAX(v.created_at) ... ${searchCondition} ...`;
  return this.prismaService.$queryRaw`${Prisma.raw(query)}`;
  ```
  Người dùng gửi `?search=' OR 1=1 --` là câu SQL bị đổi nghĩa. Cách viết an toàn là dùng tham số
  hoá — Prisma hỗ trợ sẵn qua tagged template:
  ```ts
  await this.prismaService.$queryRaw`SELECT * FROM customers WHERE name LIKE ${'%' + search + '%'}`;
  ```
  Viết như trên, Prisma gửi `search` như **tham số** tách rời, không phải một phần câu lệnh.
  (Vì sao chỗ này lại phải viết SQL thô? Vì cần sắp xếp khách hàng theo "lần khám gần nhất" —
  `MAX(v.created_at)` — mà Prisma chưa hỗ trợ trực tiếp.)
- **`console.log` sót lại** trong `visits.service.ts` (`console.log('prescriptionItems', ...)`).
  Nên xoá trước khi lên production.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Logic tập trung một chỗ, tái sử dụng được | Service dễ phình to nếu không tách nhỏ |
| Test được không cần HTTP | Ở đây service gọi thẳng Prisma → khó đổi ORM sau này |
| Bố cục giống nhau ở mọi module, dễ đoán | Bố cục là quy ước "ngầm", không có gì ép buộc tuân theo |

---
---

# Phần C — Tầng dữ liệu

## 11. Prisma & ORM

### ① Nó là gì?

Database PostgreSQL chỉ hiểu **SQL**. Còn bạn viết TypeScript. **ORM** (*Object-Relational Mapping*)
là lớp phiên dịch ở giữa: bạn gọi hàm JavaScript, nó sinh SQL, chạy, rồi biến kết quả (các dòng
bảng) thành object JavaScript.

**Prisma** là ORM được chọn cho dự án này. Nó gồm 3 mảnh:

| Mảnh | Là gì |
|---|---|
| `prisma/schema.prisma` | File mô tả các bảng — **bạn viết tay** |
| `npx prisma generate` | Lệnh đọc file trên, **sinh ra code** `@prisma/client` có sẵn kiểu dữ liệu |
| `PrismaClient` | Object bạn gọi trong service: `prisma.customer.findMany()` |

Cùng một việc, viết hai kiểu:

```sql
-- SQL thuần
SELECT * FROM customers
WHERE is_active = true AND LOWER(name) LIKE '%an%'
ORDER BY created_at DESC LIMIT 10 OFFSET 0;
```

```ts
// Prisma
this.prismaService.customer.findMany({
  where: { isActive: true, name: { contains: 'an', mode: 'insensitive' } },
  orderBy: { createdAt: 'desc' },
  take: 10,
  skip: 0,
});
```

### ② Tại sao cần?

1. **An toàn kiểu.** Gõ `prisma.custmer` → đỏ ngay. Gõ `where: { naem: ... }` → đỏ ngay. Với SQL
   dạng chuỗi, mọi lỗi chính tả chỉ lộ ra lúc chạy.
2. **Editor gợi ý.** Gõ `prisma.` rồi Ctrl+Space, VS Code xổ ra đúng danh sách bảng của dự án; gõ
   tiếp `.` xổ ra đúng các cột. Với người mới, đây là lợi ích lớn nhất — bạn không cần nhớ schema.
3. **Chống SQL Injection mặc định.** Prisma luôn gửi giá trị dưới dạng **tham số** tách rời khỏi câu
   lệnh, nên chuỗi `' OR 1=1 --` chỉ là một chuỗi vô hại. (Trừ khi bạn tự nối chuỗi rồi dùng
   `Prisma.raw` — đúng lỗi đang có trong `CustomersService.findAll`, xem mục 10.)
4. **Kết quả trả về đã là object JS.** Không phải tự map từng cột.

### ③ Codebase này dùng ra sao?

Mọi service đều tiêm `PrismaService` rồi gọi qua nó. Các phương thức được dùng trong dự án:

| Gọi | Ý nghĩa | Nơi dùng ví dụ |
|---|---|---|
| `findUnique({ where })` | Tìm 1 bản ghi theo khoá **duy nhất** (`id`, `code`, `username`) | `UsersService.findById` |
| `findFirst({ where })` | Tìm bản ghi đầu tiên khớp điều kiện **bất kỳ** | `CustomersService.create` (kiểm tra trùng) |
| `findMany({ where, skip, take, orderBy })` | Lấy danh sách | mọi `findAll` |
| `count({ where })` | Đếm tổng số | mọi `count` |
| `create({ data })` | Thêm 1 bản ghi | `VisitsService.create` |
| `createMany({ data, skipDuplicates })` | Thêm nhiều bản ghi trong 1 câu lệnh | `prisma/seed.ts` |
| `update({ where, data })` | Sửa | `CustomersService.update` |
| `upsert({ where, update, create })` | Có thì sửa, chưa có thì tạo | `VisitsService.updateVisitInfo` |
| `deleteMany({ where })` | Xoá thật nhiều bản ghi | `AuthService.revokeRefreshToken` |
| `$transaction(fn)` | Gói nhiều lệnh thành một khối "được ăn cả, ngã về không" | `VisitsService.updateVisitInfo` (mục 16) |
| `$queryRaw` | Viết SQL thô khi Prisma không diễn đạt được | `CustomersService.findAll` |

**Cách viết điều kiện `where`** — vài mẫu có thật trong codebase:

```ts
// Tìm gần đúng, không phân biệt hoa thường
{ name: { contains: search, mode: 'insensitive' } }

// HOẶC: khớp 1 trong nhiều cột
{ OR: [ { name: { contains: search } }, { parentPhone: { contains: search } } ] }

// Khoảng thời gian: gte = >=, lte = <=
{ createdAt: { gte: dauNgay, lte: cuoiNgay } }

// Loại trừ chính mình khi kiểm tra trùng lúc update
{ code, id: { not: id } }

// Lọc xuyên qua quan hệ: "visit nào có customer tên chứa ..."
{ customer: { name: { contains: search } } }

// some = "tồn tại ít nhất một bản ghi con thoả mãn"
{ permissionRoles: { some: { role: { roleUsers: { some: { userId } } } } } }
```

**Chèn thêm điều kiện có điều kiện** — mẫu `...(!!x && { ... })` xuất hiện khắp nơi:

```ts
const where = {
  isActive: true,
  ...(!!customerId && { customerId }),   // chỉ thêm dòng này KHI customerId có giá trị
};
```

Đọc là: nếu `customerId` rỗng → `false && {...}` ra `false` → spread một giá trị không phải object
thì không thêm gì cả. Nếu có giá trị → spread object `{ customerId }` vào.

**`include` vs `select`** — hai cách chọn dữ liệu trả về:

```ts
// include: lấy HẾT cột của bảng chính, THÊM dữ liệu bảng liên quan
this.prismaService.visit.findUnique({
  where: { id },
  include: { customer: true, prescription: { include: { prescriptionItems: true } } },
});

// select: chỉ lấy ĐÚNG những cột liệt kê (nhẹ hơn, an toàn hơn)
this.prismaService.visit.findMany({
  select: { id: true, customer: true, status: true, totalAmount: true /* ... */ },
});
```

`VisitsService` dùng `select` cho danh sách (nhẹ) và `include` cho chi tiết (đầy đủ) — đúng bài.

⚠️ **Sửa `schema.prisma` xong phải chạy `npx prisma generate`**, nếu không `prismaService.<bảng mới>`
sẽ báo không tồn tại. Lệnh `npx prisma migrate dev` đã tự chạy `generate` bên trong.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Gợi ý & bắt lỗi theo đúng schema thật của dự án | Phải `generate` lại mỗi lần đổi schema, hay quên |
| Chống SQL injection mặc định | Truy vấn phức tạp (GROUP BY, hàm cửa sổ) phải rơi về SQL thô |
| Cú pháp thống nhất, dễ đọc hơn SQL dài | Thêm một lớp trừu tượng: khó đoán SQL thật sinh ra là gì |
| Có sẵn hệ thống migration | Dễ vô tình tạo N+1 query (vòng lặp gọi DB từng vòng) |
| Log query bật sẵn (mục 15) giúp nhìn thấy SQL thật | Ràng buộc vào Prisma — đổi ORM sau này là viết lại toàn bộ service |

---

## 12. schema.prisma

### ① Nó là gì?

File **nguồn sự thật duy nhất** về cấu trúc database, ở `prisma/schema.prisma`. Từ file này Prisma
sinh ra: (a) các câu SQL tạo bảng — qua migration, (b) code client có kiểu — qua `generate`.

Gồm 3 loại khối:

```prisma
generator client { provider = "prisma-client-js" }        // sinh client cho JS/TS

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")                          // đọc từ biến môi trường
}

model Customer { ... }                                    // mỗi model = một bảng
enum Gender { MALE FEMALE }                               // enum = danh sách giá trị cố định
```

### ② Tại sao cần?

Không có nó, cấu trúc DB nằm rải rác trong đầu người: ai đó gõ `CREATE TABLE` trên máy mình, người
khác không biết. Có file này, cấu trúc DB **nằm trong git**, đi kèm code, review được như code.

### ③ Codebase này dùng ra sao?

**Cú pháp một dòng field:**

```prisma
parentPhone String  @map("parent_phone")
birthDate   DateTime? @map("birth_date")
visits      Visit[]
//   ↑        ↑         ↑
//  tên     kiểu      thuộc tính
//          ? = có thể null
//          [] = danh sách (quan hệ 1-nhiều)
```

**Các thuộc tính dùng trong dự án:**

| Thuộc tính | Nghĩa |
|---|---|
| `@id` | Khoá chính |
| `@default(autoincrement())` | Số tự tăng 1, 2, 3... |
| `@default(now())` | Mặc định = thời điểm tạo |
| `@updatedAt` | Prisma **tự** cập nhật mỗi lần `update` |
| `@map("ten_cot")` | Tên cột thật trong DB (snake_case) |
| `@@map("ten_bang")` | Tên bảng thật trong DB (2 dấu @ = áp cho cả model) |
| `@unique` / `@@unique([a, b])` | Không cho trùng (1 cột / tổ hợp nhiều cột) |
| `@relation(fields: [...], references: [...])` | Khai báo khoá ngoại |

**Danh sách model trong dự án:**

| Model → bảng | Vai trò |
|---|---|
| `User` → `users` | Tài khoản nhân viên |
| `RefreshToken` → `refresh_tokens` | Token gia hạn đăng nhập |
| `Role` → `roles` | Vai trò (ADMIN, USER) |
| `Permission` → `permissions` | Quyền lẻ (GET_USERS, CREATE_CUSTOMER...) |
| `UsersOnRoles` → `users_roles` | Bảng nối User ↔ Role |
| `RolesOnPermissions` → `roles_permissions` | Bảng nối Role ↔ Permission |
| `Customer` → `customers` | Bệnh nhân |
| `Visit` → `visits` | Lượt khám |
| `Prescription` / `PrescriptionItem` | Đơn thuốc / từng dòng thuốc |
| `ServiceUsage` / `ServiceUsageItem` | Phiếu dịch vụ / từng dòng dịch vụ |
| `Product` / `ProductCategory` | Thuốc / nhóm thuốc |
| `Service` / `ServiceCategory` | Dịch vụ / nhóm dịch vụ |

**Quan hệ 1-nhiều cần khai ở CẢ HAI phía:**

```prisma
model Customer {
  visits Visit[]                                              // phía "một": danh sách con
}

model Visit {
  customerId Int      @map("customer_id")                     // cột khoá ngoại thật trong DB
  customer   Customer @relation(fields: [customerId], references: [id])  // phía "nhiều"
}
```

Chỉ `customerId` là **cột thật**. Dòng `customer Customer` là *ảo* — nó tồn tại để bạn viết được
`include: { customer: true }`.

**Quan hệ nhiều-nhiều được khai bằng bảng nối tường minh:**

```prisma
model UsersOnRoles {
  userId Int @map("user_id")
  roleId Int @map("role_id")
  user   User @relation(fields: [userId], references: [id])
  role   Role @relation(fields: [roleId], references: [id])
  @@unique([userId, roleId])       // một user không được gán trùng một role 2 lần
}
```

Prisma có kiểu quan hệ nhiều-nhiều *ngầm* (viết `roles Role[]` ở cả hai bên là xong), nhưng dự án
chọn cách **tường minh** — đúng đắn, vì bảng nối ở đây còn mang thêm `isActive`, `createdAt`.

**Enum** trở thành kiểu enum thật của PostgreSQL:

```prisma
enum VisitStatus { NEW IN_PROGRESS COMPLETED CANCELLED }
```

Lợi: DB tự chặn giá trị rác. Hại: **thêm/bớt một giá trị enum phải chạy migration**, không sửa nóng được.

**Hai điểm thiết kế cần biết:**

1. **`Customer` có hai ràng buộc duy nhất chồng nhau:**
   ```prisma
   @@unique([name, parentPhone])
   @@unique([name, birthDate])
   ```
   `CustomersService.create` kiểm tra tay đúng 2 luật này trước khi ghi — để trả về thông báo tiếng
   Việt dễ hiểu thay vì lỗi kỹ thuật `P2002` của Prisma. Ràng buộc ở DB là **lưới an toàn cuối
   cùng**, kiểm tra ở service là **thông báo thân thiện**. Cần cả hai.
   ⚠️ Hệ quả kẹt: một khách hàng đã "xoá mềm" (`isActive = false`) **vẫn chiếm chỗ** ràng buộc này,
   nên không thể tạo lại khách hàng cùng tên + cùng SĐT. Đây là xung đột kinh điển giữa soft delete
   và unique constraint (mục 29).

2. **Liên kết Visit ↔ Prescription bị khai hai chiều thừa:**
   ```prisma
   model Visit        { prescriptionId Int?  prescription Prescription? @relation(...) }
   model Prescription { visitId        Int   @unique      visits        Visit[] }
   ```
   Vừa có `visits.prescription_id` trỏ sang, vừa có `prescriptions.visit_id` trỏ về. Hai cột phải
   luôn khớp nhau, không có gì đảm bảo điều đó — và về mặt kiểu, `Prescription.visits` là **mảng**,
   nghĩa là schema cho phép nhiều lượt khám dùng chung một đơn thuốc (dù nghiệp vụ không muốn thế).
   Chỉ cần giữ `prescriptions.visit_id` (đã `@unique`) là đủ. Đây là chỗ nên dọn khi có dịp — nhưng
   đừng tự ý sửa, vì code hiện tại đang ghi cả hai chiều trong `updateVisitInfo`.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Một file duy nhất mô tả toàn bộ DB, nằm trong git | Là ngôn ngữ riêng của Prisma, phải học cú pháp |
| Sinh ra cả migration lẫn kiểu TypeScript | Vài tính năng Postgres (view, trigger, partial index) chưa hỗ trợ tốt |
| `@map` cho phép code camelCase, DB snake_case | Phải nhớ `@map` từng cột, quên là tên cột thành camelCase |
| Đọc là hình dung ra được sơ đồ quan hệ | File phình to dần, không tách nhỏ được (trước v6) |

---

## 13. Migration

### ① Nó là gì?

Một **file SQL được đánh số theo thời gian**, ghi lại đúng một thay đổi cấu trúc DB. Nằm ở
`prisma/migrations/<thời-gian>_<tên>/migration.sql`.

Ví von: `schema.prisma` là *bản vẽ hiện tại* của ngôi nhà; thư mục `migrations/` là *nhật ký thi công* —
"ngày 1 xây móng, ngày 2 thêm cửa sổ, ngày 3 sơn lại".

### ② Tại sao cần?

DB thật đã có dữ liệu — không thể xoá đi tạo lại mỗi lần đổi schema. Migration cho phép **biến đổi
dần** cấu trúc mà giữ nguyên dữ liệu, và làm điều đó **giống hệt nhau** trên máy bạn, máy đồng
nghiệp, và máy chủ production.

Prisma còn dùng bảng `_prisma_migrations` trong chính DB để nhớ migration nào đã chạy → chạy lại
lệnh cũng không bị áp dụng hai lần.

### ③ Codebase này dùng ra sao?

Lịch sử 5 migration của dự án — đọc nó như đọc lịch sử tiến hoá của DB:

| Thư mục | Nội dung |
|---|---|
| `20250201015436_init` | Tạo toàn bộ enum + 15 bảng ban đầu |
| `20250201080352_x` | Thêm cột `visits.count_by_customer` (mặc định 0) |
| `20250201080556_x` | Đổi mặc định cột đó thành 1 |
| `20250202090340_x` | Thêm cột `visits.total_discount` |
| `20250202144225_x` | Bỏ unique trên `customers.parent_phone`, thay bằng 2 unique tổ hợp |

(Đặt tên `_x` là thói quen xấu — vô nghĩa. Hãy đặt tên có ý nghĩa: `--name add_visit_discount`.)

**Hai lệnh, hai hoàn cảnh:**

```bash
npx prisma migrate dev --name add_appointments   # LÚC PHÁT TRIỂN
```
→ so sánh `schema.prisma` với DB, sinh file SQL mới, chạy nó, rồi `generate` lại client.
Có thể hỏi bạn xoá DB nếu phát hiện "trôi" (drift).

```bash
npx prisma migrate deploy                        # LÚC TRIỂN KHAI / máy mới
```
→ chỉ chạy các migration chưa áp dụng. Không sinh file mới, không bao giờ xoá dữ liệu.

**Quy tắc sống còn:**

- **Không bao giờ sửa tay một file migration đã chạy** ở nơi khác. Muốn đổi → tạo migration mới.
- File `migration_lock.toml` ghi `provider = "postgresql"` — đừng sửa, đừng xoá.
- `make remove` chạy `docker compose down -v`, **xoá luôn volume** → mất sạch dữ liệu. Sau đó phải
  `migrate deploy` + `db seed` lại từ đầu.
- Migration đổi cấu trúc **không** tự sửa dữ liệu cũ. Ví dụ migration cuối thêm ràng buộc unique:
  nếu trong bảng đang có 2 khách trùng (tên + SĐT), lệnh sẽ **thất bại**. File SQL của Prisma có ghi
  sẵn cảnh báo đó ở đầu file.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Mọi môi trường có cấu trúc DB giống hệt nhau | Migration hỏng giữa chừng ở production rất khó gỡ |
| Nằm trong git → review và truy vết được | Phải cẩn thận thủ công với dữ liệu đã có |
| Prisma tự sinh SQL, không phải viết tay | `migrate dev` có thể đề nghị xoá DB — chạy nhầm ở prod là thảm hoạ |
| Có thể mở file SQL ra đọc, hiểu chính xác điều gì xảy ra | Không có cơ chế "lùi lại" (rollback) tự động |

---

## 14. Seed

### ① Nó là gì?

Script nhồi **dữ liệu khởi tạo** vào DB trống. "Seed" = gieo hạt.

Có hai loại:
- **Dữ liệu bắt buộc** để hệ thống chạy được: danh mục quyền, vai trò ADMIN, tài khoản admin đầu tiên.
  → `prisma/seed.ts`
- **Dữ liệu giả** để lập trình/demo: 100 khách hàng, thuốc, lượt khám.
  → `prisma/2_seed_customers.ts`, `3_seed_product_service.ts`, `4_seed_visits.ts`

### ② Tại sao cần?

Migration tạo **bảng rỗng**. Nhưng app không đăng nhập được nếu chưa có user nào, và
`PermissionsGuard` không cho ai đi qua nếu bảng `permissions` trống. Seed lấp khoảng trống đó, và
đảm bảo mọi thành viên trong team có cùng bộ dữ liệu nền để thử.

### ③ Codebase này dùng ra sao?

Đăng ký trong `package.json`, nên gọi được bằng lệnh chuẩn của Prisma:

```jsonc
"prisma": { "seed": "ts-node prisma/seed.ts" }
```

```bash
npx prisma db seed
```

`prisma/seed.ts` làm 5 việc theo thứ tự:

```ts
// 1. Tạo 2 tài khoản, mật khẩu ĐÃ BĂM bằng bcrypt
const passwordHash1 = await bcrypt.hash('123456', 10);
await prisma.user.upsert({ where: { username: 'admin' }, update: {}, create: { ... } });

// 2. Tạo mọi Permission từ enum — không phải liệt kê tay
const permissions = Object.values(PermissionNameType);

// 3. Tạo 2 Role: ADMIN, USER
// 4. ADMIN ← toàn bộ quyền;  USER ← chỉ 4 quyền xem (GET_USER/S, GET_ROLE/S)
// 5. Gán cả 2 user vào role ADMIN
```

Tài khoản có sẵn sau khi seed: **`admin` / `123456`** và **`thaonhi` / `thaonhi`**.

**Hai kỹ thuật khiến seed chạy lại nhiều lần vẫn an toàn (idempotent):**

```ts
prisma.user.upsert({ where: { username: 'admin' }, update: {}, create: {...} })
//     ↑ có rồi thì KHÔNG làm gì (update rỗng), chưa có thì tạo

prisma.rolesOnPermissions.createMany({ data: [...], skipDuplicates: true })
//                                                  ↑ bỏ qua dòng đã tồn tại
```

Nhờ vậy gõ `npx prisma db seed` mười lần cũng không sinh dữ liệu rác. Đây là tiêu chuẩn cần theo khi
bạn viết seed mới.

`Object.values(PermissionNameType)` là chi tiết đáng học: thêm một quyền vào enum thì seed **tự
động** biết, không phải sửa seed. Nhưng vẫn phải nhớ sửa enum ở **cả hai** nơi (`schema.prisma` và
`src/constants/permissions/`) rồi migrate — xem mục 23.

Các seed đánh số **không** đăng ký với Prisma, chạy riêng từng file:

```bash
npx ts-node prisma/2_seed_customers.ts
```

Chúng tự bảo vệ bằng cách kiểm tra trước: `if (customers.length > 0) return;` — chạy hai lần không
nhân đôi dữ liệu.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Máy mới dựng xong là dùng được ngay | Mật khẩu mặc định `admin/123456` **phải đổi** trước khi lên thật |
| `upsert` + `skipDuplicates` → chạy lại vô hại | Seed dữ liệu giả và seed dữ liệu bắt buộc dễ bị chạy nhầm nhau |
| Sinh quyền tự động từ enum, không sót | Các file đánh số phải nhớ chạy đúng thứ tự (khách hàng trước, lượt khám sau) |
| Cả team cùng một bộ dữ liệu để thử | Không có lệnh gộp "chạy hết seed" |

---

## 15. PrismaService

### ① Nó là gì?

Lớp áo NestJS khoác lên `PrismaClient`, ở `src/prisma/prisma.service.ts`:

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit()    { await this.$connect(); }
  async onModuleDestroy() { await this.$disconnect(); }
}
```

Vì `extends PrismaClient`, nó **có đủ mọi thứ** của PrismaClient (`.customer`, `.visit`,
`$transaction`...), cộng thêm hai thứ: vòng đời NestJS và log query.

### ② Tại sao cần?

1. **Vòng đời.** `OnModuleInit` / `OnModuleDestroy` là hai "móc" NestJS gọi khi app khởi động và
   khi app tắt. Nhờ đó kết nối DB được mở đúng lúc và **đóng sạch** khi tắt app — không để lại
   kết nối treo.
2. **Được DI quản lý.** Có `@Injectable()` nên Nest tạo **đúng một** instance dùng chung cho cả app
   (mục 8) → chỉ một connection pool.
3. **Nhìn thấy SQL thật.** Constructor bật log sự kiện và in ra terminal mọi câu query:
   ```ts
   super({ log: [{ level: 'query', emit: 'event' }, ...] });
   this.$on('query', (e) => this.loggerTerminal.log(blue(this.simplifyQuery(e.query, e.params, e.duration))));
   ```
   `simplifyQuery` thay `$1`, `$2` bằng giá trị thật để bạn copy câu SQL đó dán thẳng vào psql chạy thử.
   Với người mới, đây là **công cụ học tốt nhất trong dự án**: gọi một API rồi nhìn terminal xem
   Prisma thực sự sinh ra SQL gì.

### ③ Codebase này dùng ra sao?

Được cung cấp bởi `PrismaModule` — module này chỉ có 3 dòng nhưng là mắt xích quan trọng:

```ts
@Module({
  providers: [PrismaService],
  exports:   [PrismaService],   // ⭐ không có dòng này, module khác không dùng được
})
export class PrismaModule {}
```

Rồi mọi module nghiệp vụ `imports: [PrismaModule]` và mọi service tiêm nó vào:

```ts
constructor(private prismaService: PrismaService) {}
```

**Ba điều dễ vấp:**

- ⚠️ **Hai thư mục tên `prisma`.** `prisma/` ở gốc = schema/migrations/seed (không phải code app).
  `src/prisma/` = file này. Import `from 'prisma/prisma.service'` trỏ tới `src/prisma/` vì
  `baseUrl` là `./src` (mục 4).
- ⚠️ **`AuthModule` không import `PrismaModule`** mà tự khai `providers: [..., PrismaService]` →
  Nest tạo **instance thứ hai**, mở thêm một pool kết nối. Chạy vẫn được nhưng lãng phí và không
  nhất quán. Nếu sửa: `imports: [PrismaModule, UsersModule]` và bỏ hai provider thừa.
- ⚠️ **`simplifyQuery` có lỗi nhỏ**: nó thay `$1` trước `$10`, nên câu query từ 10 tham số trở lên
  in ra sai. Chỉ ảnh hưởng log, không ảnh hưởng dữ liệu.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Một kết nối dùng chung toàn app | Service kế thừa PrismaClient → mọi nơi có toàn quyền với mọi bảng |
| Đóng kết nối sạch khi tắt app | Log query bật cả ở production sẽ rất ồn và có thể lộ dữ liệu |
| Log SQL giúp học và gỡ lỗi cực nhanh | Không có lớp repository → service phụ thuộc trực tiếp Prisma |
| Tiêm được vào bất cứ đâu qua DI | `AuthModule` đang phá vỡ tính "một instance" |

---

## 16. Transaction

### ① Nó là gì?

Một nhóm lệnh ghi vào DB được gói lại thành **một khối duy nhất**: hoặc **tất cả** thành công, hoặc
**không câu nào** có hiệu lực. Không có trạng thái nửa vời.

Ví dụ kinh điển là chuyển khoản: trừ tiền tài khoản A, cộng tiền tài khoản B. Nếu lệnh 1 chạy xong,
lệnh 2 lỗi (mất điện, mất mạng) mà không có transaction → tiền **bốc hơi**.

### ② Tại sao cần trong dự án này?

Lưu một lượt khám cần **3 lệnh ghi**:

1. Ghi/cập nhật đơn thuốc (`prescriptions` + toàn bộ `prescription_items`)
2. Ghi/cập nhật phiếu dịch vụ (`service_usages` + `service_usage_items`)
3. Cập nhật lượt khám: gắn id của hai cái trên + tính lại `totalAmount`

Nếu lệnh 1 xong rồi lệnh 3 lỗi: đơn thuốc đã bị xoá hết item cũ và ghi item mới, nhưng lượt khám vẫn
trỏ vào đơn cũ và tổng tiền vẫn là số cũ → **hồ sơ bệnh án sai lệch**. Với dữ liệu y tế và tiền bạc,
điều này không chấp nhận được.

### ③ Codebase này dùng ra sao?

Chỉ một chỗ duy nhất: `VisitsService.updateVisitInfo` — và đó là hàm phức tạp nhất codebase.

```ts
const updatedVisit = await this.prismaService.$transaction(async (tx) => {
  //                                                            ↑ tx = "client tạm" của transaction
  const updatePrescription = await tx.prescription.upsert({ ... });
  const updateServiceUsage = await tx.serviceUsage.upsert({ ... });

  const updateVisit = await tx.visit.update({
    where: { id: visitId },
    data: {
      ...rest,
      prescriptionId: updatePrescription.id,
      serviceUsageId: updateServiceUsage.id,
      totalAmount: updatePrescription.totalAmount + updateServiceUsage.totalAmount,
    },
  });

  return updateVisit;
});
```

🔑 **Quy tắc số 1**: bên trong khối transaction, **phải** gọi qua `tx`, tuyệt đối không gọi
`this.prismaService`. Lệnh gọi qua `this.prismaService` chạy ở **ngoài** transaction — nó sẽ không
được huỷ khi transaction thất bại. Đây là lỗi rất khó phát hiện vì code vẫn chạy bình thường.

**Chiến thuật "xoá sạch rồi ghi lại" cho các dòng con:**

```ts
prescriptionItems: {
  deleteMany: {},                                   // xoá HẾT item cũ của đơn này
  ...(prescriptionItems?.length > 0 && {
    createMany: { data: prescriptionItems },        // rồi tạo lại toàn bộ item mới
  }),
}
```

Vì sao không so sánh cái nào thêm/sửa/xoá cho tinh tế? Vì so sánh phức tạp và dễ sai. Xoá hết rồi
ghi lại đơn giản, luôn đúng, và an toàn nhờ đang nằm trong transaction.
Cái giá phải trả: `id` của các item **đổi mỗi lần lưu**, `createdAt` bị đặt lại — nên đừng bao giờ
trỏ tới `prescription_items.id` từ nơi khác.

**`upsert`** giải quyết chuyện "lần lưu đầu tiên chưa có đơn thuốc":

```ts
tx.prescription.upsert({
  where:  { visitId },      // tìm theo visitId (đang có @unique nên dùng được ở đây)
  update: { ... },          // tìm thấy → chạy nhánh này
  create: { visitId, ... }, // không thấy → chạy nhánh này
});
```

**Ba điểm yếu của hàm này cần biết** (để không sập khi bạn gọi API):

```ts
const { prescriptionItems, ...prescriptionData } = prescription;
const { serviceUsageItems, ...serviceUsageData } = serviceUsage;
```
1. `prescription` và `serviceUsage` đều là **optional** trong `UpdateVisitDto`. Chỉ gửi
   `{ "diagnosis": "..." }` là hai dòng trên nổ `Cannot destructure property of undefined` → 500.
   Nghĩa là **muốn sửa bất cứ gì cũng phải gửi kèm cả đơn thuốc và phiếu dịch vụ**. Nếu
   `strictNullChecks` được bật (mục 3), TypeScript đã chặn từ lúc viết.
2. `catch (error) { throw new InternalServerErrorException(error) }` — mọi lỗi đều thành 500, kể cả
   lỗi đáng lẽ phải là 400 (ví dụ `productId` không tồn tại). Thông báo lỗi thô của Prisma cũng bị
   đẩy thẳng ra ngoài cho client.
3. Còn sót `console.log('prescriptionItems', ...)`.

**Có hai kiểu transaction trong Prisma:**

```ts
// Kiểu 1 — mảng lệnh: đơn giản, các lệnh KHÔNG phụ thuộc nhau
await prisma.$transaction([ prisma.a.create(...), prisma.b.update(...) ]);

// Kiểu 2 — hàm (interactive): dùng khi lệnh sau cần KẾT QUẢ của lệnh trước ← dự án dùng kiểu này
await prisma.$transaction(async (tx) => { ... });
```

Ở đây bắt buộc là kiểu 2, vì `visit.update` cần `updatePrescription.id` do lệnh trước sinh ra.

⚠️ Đừng nhầm `$transaction` với `Promise.all` trong `getListVisits`. `Promise.all` chỉ là *chạy song
song hai việc đọc*, không có tính "được ăn cả ngã về không". Dùng cho việc đọc thì tốt, cho việc ghi
thì sai.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Dữ liệu không bao giờ ở trạng thái nửa vời | Giữ khoá trên bảng lâu hơn → nhiều người ghi cùng lúc sẽ chậm |
| Cho phép chiến thuật "xoá hết ghi lại" đơn giản mà an toàn | Transaction có timeout mặc định (5s ở Prisma) |
| Viết dạng hàm, đọc như code tuần tự bình thường | Quên dùng `tx` là bug ngầm, rất khó thấy |
| | Không được gọi API bên ngoài (gửi mail...) bên trong transaction |

---
---

# Phần D — Dữ liệu vào/ra

## 17. DTO (Data Transfer Object)

### ① Nó là gì?

Một class mô tả **hình dạng dữ liệu đi vào** một endpoint, kèm luật hợp lệ cho từng trường.
"Tờ khai hải quan" của request.

```ts
export class CreateCustomerDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsEnum(Gender) @IsOptional()
  gender?: Gender;
}
```

### ② Tại sao cần?

**Không bao giờ tin dữ liệu từ bên ngoài.** Frontend có thể lỗi; ai đó có thể gọi API bằng Postman
với dữ liệu bịa; kẻ xấu có thể cố tình gửi rác.

DTO đặt một cánh cổng ở cửa: dữ liệu sai bị chặn **trước khi** chạm vào service, và trả về thông báo
rõ ràng. Đổi lại, trong service bạn được lập trình với giả định "dữ liệu vào luôn đúng dạng" — code
sạch hơn hẳn vì không phải rải `if (!name) ...` khắp nơi.

Ba lợi ích kèm theo:
- **Tài liệu.** Nhìn DTO là biết endpoint nhận gì — không cần đọc service.
- **Swagger.** `@ApiProperty` trên DTO sinh ra form thử nghiệm tự động (mục 33).
- **Lọc trường thừa.** Chỉ những trường được khai mới được dùng (khi bật `whitelist`, xem mục 19).

### ③ Codebase này dùng ra sao?

Mỗi module có 3 DTO theo đúng khuôn:

```
dto/
├── create-<x>.dto.ts   ← đủ trường, đánh dấu bắt buộc/tuỳ chọn
├── update-<x>.dto.ts   ← thường = create nhưng mọi trường optional
└── filter-<x>.dto.ts   ← tham số query cho danh sách
```

**`update` được sinh ra từ `create`** bằng hai hàm tiện ích của `@nestjs/swagger`:

```ts
// PartialType: sao chép mọi trường của CreateCustomerDto và biến hết thành optional
export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}

// OmitType: bỏ bớt trường; ở đây bỏ 'password' → API sửa user KHÔNG cho đổi mật khẩu
export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['password'] as const)) {
  @IsBoolean() @IsOptional()
  isActive: boolean;                       // và thêm trường mới để bật/tắt (soft delete)
}
```

Lợi ích: sửa `CreateCustomerDto` thì `UpdateCustomerDto` **tự** theo, không bao giờ lệch nhau.

**`filter` kế thừa DTO phân trang dùng chung:**

```ts
export class FilterVisitDto extends PaginationWithSearchParamsDto {   // có sẵn page, pageSize, search
  @IsOptional() @IsNumber() @Transform(({ value }) => Number(value))
  customerId?: number;                                                // thêm bộ lọc riêng
}
```

**DTO lồng nhau** — trường hợp khó nhất, ở `update-visit.dto.ts`:

```ts
export class UpdateVisitDto {
  @ValidateNested()                    // ⭐ "hãy kiểm tra cả BÊN TRONG object này"
  @Type(() => PrescriptionDto)         // ⭐ "biến JSON thô thành instance của PrescriptionDto"
  @IsOptional()
  prescription?: PrescriptionDto;
}

export class PrescriptionDto {
  @ValidateNested({ each: true })      // each: true = kiểm tra TỪNG phần tử của mảng
  @Type(() => PrescriptionItemDto)
  prescriptionItems: PrescriptionItemDto[];
}
```

⚠️ **Thiếu `@Type()` là bug ngầm kinh điển**: dữ liệu vào vẫn là object JSON thường, class-validator
không biết nó thuộc class nào nên **bỏ qua không kiểm tra**, và bạn tưởng là đã kiểm tra rồi.
Hễ có `@ValidateNested` thì phải có `@Type` đi kèm.

**Một khoảng trống của dự án: không có DTO cho dữ liệu ĐI RA.**

Service `return` thẳng object Prisma, nên client nhận đúng mọi cột trong DB. Hệ quả thật:

```ts
// UsersService.findById
return this.prismaService.user.findUnique({ where: { id } });   // ← có cả cột password
```
→ `GET /api/v1/users/1` và `GET /api/v1/users` **trả về cả mã băm mật khẩu**. Không ai đọc ngược ra
mật khẩu gốc được, nhưng vẫn là dữ liệu không nên lộ. `AuthService.login` thì có xử lý:

```ts
const { password, ...result } = findUser;   // tách password ra rồi mới trả về
```

Cách làm bài bản: dùng `select` liệt kê đúng cột cần, hoặc thêm response DTO + `ClassSerializerInterceptor`.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Chặn dữ liệu rác ngay ở cửa | Thêm khá nhiều file cho mỗi resource |
| Service được viết với giả định dữ liệu đã sạch | Dễ lệch giữa DTO và schema Prisma nếu sửa một bên |
| Vừa là tài liệu, vừa sinh Swagger | `PartialType` khiến mọi trường optional — kể cả trường đáng lẽ bắt buộc khi update |
| `PartialType`/`OmitType` tránh chép code | Chỉ có DTO đầu vào → dữ liệu đầu ra không được kiểm soát (rò `password`) |

---

## 18. class-validator & class-transformer

### ① Chúng là gì?

Hai thư viện đi cùng nhau, làm hai việc khác nhau:

| Thư viện | Việc | Decorator tiêu biểu |
|---|---|---|
| **class-transformer** | **Biến đổi**: JSON thô → instance của class, ép kiểu | `@Type()`, `@Transform()` |
| **class-validator** | **Kiểm tra**: giá trị có hợp lệ không | `@IsString()`, `@Min()`, `@IsEnum()` |

Thứ tự luôn là: **transform trước, validate sau**. Hiểu điều này giải thích được hầu hết các lỗi lạ.

### ② Tại sao cần?

Vì **mọi thứ đến từ HTTP đều là chuỗi**. Query `?page=1` cho bạn chuỗi `"1"`, không phải số `1`.

```ts
@IsNumber()
page?: number;                          // ❌ luôn lỗi: "1" không phải number

@Transform(({ value }) => Number(value))
@IsNumber()
page?: number;                          // ✅ đổi "1" → 1 rồi mới kiểm tra
```

Đó chính là lý do **mọi trường số trong filter DTO của dự án đều có `@Transform`**. Nếu bạn thêm một
bộ lọc số mới mà quên dòng này, API sẽ trả 400 với thông báo khó hiểu kiểu
`page must be a number conforming to the specified constraints`.

(Body JSON thì khác: `{"page": 1}` đã là số thật, nên không bắt buộc `@Transform`. Nhưng thêm vào
cũng vô hại và giúp đồng nhất.)

### ③ Codebase này dùng ra sao?

**Các luật kiểm tra đang dùng:**

| Decorator | Ý nghĩa | Ví dụ trong dự án |
|---|---|---|
| `@IsString()` `@IsNumber()` `@IsInt()` `@IsBoolean()` `@IsDate()` | Kiểm tra kiểu | khắp nơi |
| `@IsNotEmpty()` | Bắt buộc, không được rỗng | `CreateCustomerDto.name` |
| `@IsOptional()` | Có thể vắng mặt — ⭐ **vắng thì mọi luật khác bị bỏ qua** | `gender?` |
| `@IsEnum(Gender)` | Chỉ nhận giá trị trong enum | `CreateVisitDto.status` |
| `@Min(1)` `@Max(100)` | Chặn khoảng số | `pageSize` tối đa 100 |
| `@MinLength(6)` | Độ dài chuỗi tối thiểu | `LoginDto.password` |
| `@IsArray()` | Phải là mảng | `CreateUserDto.roleIds` |
| `@IsDateString()` | Chuỗi ngày hợp lệ | `CreateCustomerDto.birthDate` |
| `@ValidateNested()` | Kiểm tra cả object con | `UpdateVisitDto.prescription` |

**Hai kiểu biến đổi:**

```ts
// @Transform — bạn tự viết hàm biến đổi
@Transform(({ value }) => Number(value))               // "10" → 10
@Transform(({ value }) => value?.trim())               // " ADMIN " → "ADMIN"   (create-role.dto)
@Transform(({ value }) => new Date(value).toISOString())  // "2024-01-01" → chuỗi ISO (create-customer.dto)
@Transform(({ value }) => (value ? new Date(value) : undefined))  // → object Date (update-visit.dto)

// @Type — chỉ định class đích, dùng cho object/mảng lồng nhau
@Type(() => PrescriptionItemDto)
```

Chú ý sự không nhất quán nhỏ: `birthDate` được `@Transform` thành **chuỗi ISO** rồi khai kiểu
`Date`; `reExaminationTime` thì thành **object Date** thật. Cả hai đều chạy được vì Prisma nhận cả
hai dạng, nhưng nên thống nhất một kiểu.

⚠️ **`@IsOptional()` mạnh hơn bạn nghĩ.** Nếu trường vắng mặt **hoặc** bằng `null`/`undefined`, mọi
decorator kiểm tra khác trên trường đó bị bỏ qua hoàn toàn. Rất tiện, nhưng đừng dùng nó cho những
trường thật ra là bắt buộc.

⚠️ **Dự án chưa bật `whitelist`.** `ValidationPipe` đang khai `{ transform: true }` mà thôi, nên
trường lạ không được khai trong DTO **vẫn đi qua**. Ví dụ gửi
`PATCH /customers/1 { "name": "A", "hacked": 1 }`, DTO không có `hacked` nhưng nó vẫn nằm trong
object, và service làm `data: updateCustomerDto` → Prisma báo lỗi "Unknown argument `hacked`" (may
là Prisma chặn). Bật `whitelist: true` (và `forbidNonWhitelisted: true` nếu muốn báo lỗi rõ) sẽ
sạch sẽ hơn nhiều. Xem mục 19.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Luật kiểm tra nằm ngay cạnh khai báo trường | Phải nhớ cặp `@ValidateNested` + `@Type`, thiếu là mất kiểm tra âm thầm |
| Có sẵn hàng trăm luật dựng sẵn | Thứ tự transform → validate không hiển nhiên, gây lỗi khó hiểu |
| `@Transform` xử lý được mọi ca đặc biệt | Thông báo lỗi mặc định bằng tiếng Anh, chưa thân thiện với người dùng cuối |
| Dùng chung DTO cho cả validation lẫn Swagger | Chưa bật `whitelist` → mất một lớp bảo vệ |

---

## 19. Pipe & ValidationPipe

### ① Nó là gì?

**Pipe** là trạm xử lý nằm ngay **trước** controller, làm một trong hai việc (hoặc cả hai) với dữ
liệu đầu vào: **biến đổi** (transform) và **kiểm tra** (validate).

**ValidationPipe** là pipe có sẵn của NestJS: nó lấy DTO bạn khai ở tham số handler, dùng
class-transformer + class-validator (mục 18) để xử lý, và **ném lỗi 400** nếu không hợp lệ.

### ② Tại sao cần?

Nó là mắt xích biến DTO từ "một class trang trí đẹp" thành thứ **thực sự có hiệu lực**. Không có
`ValidationPipe`, mọi decorator `@IsString()` bạn viết chỉ nằm đó và không ai đọc.

### ③ Codebase này dùng ra sao?

Bật **một lần duy nhất, toàn cục**, trong `src/main.ts`:

```ts
app.useGlobalPipes(new ValidationPipe({ transform: true }));
```

Từ giờ, **mọi** `@Body()`, `@Query()`, `@Param()` có kiểu là một class DTO đều được kiểm tra tự động.

**`transform: true` làm hai việc, và việc thứ hai rất quan trọng:**

1. Ép kiểu nguyên thuỷ theo `@Transform`/`@Type` (chuỗi → số...).
2. **Tạo ra một instance thật của class DTO** (không phải object JSON thường). Đây là lý do khiến
   giá trị mặc định phân trang hoạt động:

```ts
export class PaginationWithSearchParamsDto {
  page?: number;
  pageSize?: number;

  constructor() {                                       // ⭐ constructor CHỈ chạy khi transform: true
    this.page = COMMON_CONSTANT.DEFAULT_PAGE;           // = 1
    this.pageSize = COMMON_CONSTANT.DEFAULT_PAGE_SIZE;  // = 10
  }
}
```

Gọi `GET /customers` không kèm tham số → constructor chạy → `page = 1`, `pageSize = 10` → service
tính `skip: (1-1)*10 = 0` bình thường. Nếu ai đó đổi thành `transform: false`, constructor không
chạy, `page` là `undefined`, và `skip: NaN` → toàn bộ API danh sách hỏng. Một dòng cấu hình nhỏ,
hệ quả lớn.

*(Đây là cách làm khá bất thường — cách phổ biến hơn là gán mặc định ngay tại field:
`page?: number = 1;`. Hai cách đều dựa vào `transform: true`, nhưng gán tại field thì dễ đọc hơn.)*

**Khi kiểm tra thất bại**, ValidationPipe ném `BadRequestException` với `message` là một **mảng**:

```jsonc
{ "message": ["name should not be empty", "pageSize must not be greater than 100"], ... }
```

`AllExceptionFilter` chỉ lấy phần tử đầu (mục 26):

```ts
message: Array.isArray(message) ? message[0] : message
```

→ Client chỉ thấy **một** lỗi mỗi lần. Đơn giản cho frontend, nhưng người dùng phải sửa từng lỗi một.

**Các pipe dựng sẵn khác** — dự án chưa dùng, nhưng nên biết:

```ts
// Cách dự án đang làm: nhận chuỗi rồi tự ép bằng dấu +
findOne(@Param('id') id: string) { return this.service.findOne(+id); }

// Cách dùng pipe: ép + kiểm tra ngay tại cửa; gọi /customers/abc sẽ trả 400 thay vì lỗi Prisma
findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findOne(id); }
```

Hiện tại gọi `GET /api/v1/customers/abc` → `+'abc'` ra `NaN` → Prisma nổ → 500. Dùng `ParseIntPipe`
sẽ ra 400 đúng nghĩa. Đây là cải tiến nhỏ, đáng làm.

**Nên bổ sung khi có dịp:**

```ts
new ValidationPipe({
  transform: true,
  whitelist: true,             // loại bỏ trường không khai trong DTO
  forbidNonWhitelisted: true,  // hoặc báo lỗi luôn nếu có trường lạ
})
```

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Bật 1 dòng, áp dụng cho toàn bộ app | "Ma thuật ẩn": người mới không biết ai đang kiểm tra dữ liệu |
| Controller nhận dữ liệu đã sạch và đúng kiểu | Phụ thuộc chặt vào `transform: true` (mặc định phân trang) |
| Thông báo lỗi tự sinh, không phải viết tay | Chỉ trả 1 lỗi vì filter cắt mảng còn phần tử đầu |
| Có thể áp riêng cho từng route/tham số | Chưa bật `whitelist` → trường lạ vẫn lọt vào service |

---
---

# Phần E — Đường đi của request

> Bốn thành phần trong phần này (Middleware, Guard, Interceptor, Filter) đều là **lớp bọc** quanh
> controller. Chúng tồn tại để những việc *lặp lại ở mọi endpoint* — ghi log, kiểm tra đăng nhập,
> định dạng response, xử lý lỗi — chỉ phải viết **một lần**. Mục 27 ráp tất cả lại theo đúng thứ tự.

## 20. Middleware

### ① Nó là gì?

Hàm chạy **sớm nhất**, ngay khi request vừa vào, **trước cả Guard**. Đây là khái niệm mượn nguyên từ
Express (thư viện HTTP mà NestJS chạy bên trên).

```ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('[Middleware] Request...');
    next();                    // ⭐ BẮT BUỘC: chuyển tiếp. Quên gọi → request treo vĩnh viễn
  }
}
```

Ba tham số: `req` (request), `res` (response), `next` (hàm "cho đi tiếp"). Nếu không gọi `next()`,
request đứng im cho tới khi timeout — lỗi kinh điển của người mới.

### ② Tại sao cần?

Cho những việc thuộc về **tầng HTTP thuần tuý**, chưa liên quan gì tới nghiệp vụ:

- Ghi log mọi request vào ra.
- Gắn `requestId` để lần vết một request xuyên suốt hệ thống log.
- Nén dữ liệu (gzip), thêm header bảo mật (helmet), giới hạn số request (rate limit).
- Đọc cookie, parse body.

**Điểm phân biệt quan trọng với Guard**: middleware chạy trước khi NestJS quyết định *handler nào sẽ
xử lý request này*, nên nó **không đọc được** metadata của decorator (`@Permissions(...)`). Cần đọc
decorator → phải dùng Guard hoặc Interceptor.

### ③ Codebase này dùng ra sao?

Chỉ có một, và nó gần như chưa làm gì:

```ts
// src/app.module.ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');   // '*' = áp cho MỌI route
  }
}
```

Mỗi request in ra đúng dòng `[Middleware] Request...` — không cho biết method, URL hay thời gian
xử lý. Nó là **chỗ giữ chỗ** (placeholder) hơn là công cụ thật.

Bản hữu ích hơn, viết lại chừng 10 dòng:

```ts
use(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {                              // chạy khi response đã gửi xong
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
  });
  next();
}
```

Dự án cũng đã cài sẵn **winston** và có `src/utils/logger-factory.util.ts` ghi log ra file
`logs/dev-info.log` / `logs/dev-error.log` — nhưng **chưa nơi nào dùng nó**. Đây là chỗ ghép vào tự
nhiên nhất nếu bạn muốn có log thật.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Chạy sớm nhất → chặn/ghi nhận được mọi request | Không biết handler nào sẽ chạy, không đọc được decorator |
| Dùng lại được cả kho middleware Express có sẵn | Làm việc với `req`/`res` thô, không có DTO |
| Áp theo route rất linh hoạt | Quên `next()` là treo request |
| Tách hẳn khỏi nghiệp vụ | Ở dự án này gần như chưa mang lại giá trị gì |

---

## 21. Guard

### ① Nó là gì?

**Người gác cửa.** Một class có đúng một phương thức `canActivate` trả về `true` (cho qua) hoặc
`false`/ném lỗi (chặn lại).

```ts
@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ... quyết định ...
    return true;
  }
}
```

`ExecutionContext` là "hộp ngữ cảnh": từ nó lấy được request (`context.switchToHttp().getRequest()`),
biết được handler nào sắp chạy (`context.getHandler()`), class nào (`context.getClass()`).

### ② Tại sao cần?

Vì câu hỏi "người này có được phép không?" lặp lại ở **mọi** endpoint. Không có Guard, mỗi controller
phải tự viết:

```ts
create(@Req() req) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) throw new UnauthorizedException();
  // ... lặp lại y hệt ở 30 hàm khác ...
}
```

Guard gom việc đó ra ngoài, gắn bằng một dòng decorator, và **chạy trước khi controller được gọi** —
nên code nghiệp vụ không bao giờ chạm phải request chưa xác thực.

### ③ Codebase này dùng ra sao?

Có đúng **2 guard**, luôn đi cặp và **đúng thứ tự**:

```ts
// src/decorators/claims-auth.decorator.ts
UseGuards(JwtAuthGuard, PermissionsGuard)
//        ①            ②
```

| # | Guard | Câu hỏi | Chặn thì trả |
|---|---|---|---|
| ① | `JwtAuthGuard` | "Anh **là ai**?" — token có hợp lệ không | `401 Unauthorized` |
| ② | `PermissionsGuard` | "Anh **được phép** làm việc này không?" | `403 Forbidden` |

🔑 **Thứ tự trong `UseGuards(...)` chính là thứ tự chạy**, và ở đây bắt buộc phải vậy:
`JwtAuthGuard` gán `request.user`, `PermissionsGuard` đọc `request.user.id` để tra quyền. Đảo lại
thì guard thứ hai luôn thấy `user` rỗng và ném `ForbiddenException('User not found')`.

Guard được gắn ở **cấp class** trên hầu hết controller thông qua `@AuthClaims()` (mục 24):

```ts
@Controller('customers')
@AuthClaims()                    // ⭐ áp cho MỌI hàm trong class
export class CustomersController { ... }
```

`AuthController` cố tình **không** gắn ở cấp class — vì `login` phải gọi được khi chưa có token.
Nó chỉ gắn riêng cho `logout`:

```ts
@AuthClaims()
@Post('logout')
async logout(@Req() req: any) { ... }
```

**Ba cấp gắn guard** (dự án dùng cấp 1 và 2):

```ts
@UseGuards(MyGuard)             // trên class    → mọi route trong class
@UseGuards(MyGuard)             // trên phương thức → chỉ route đó
app.useGlobalGuards(new ...)    // trong main.ts → toàn app (dự án KHÔNG dùng cách này)
```

Cách phổ biến hơn ở các dự án khác là gắn guard toàn cục rồi đánh dấu route công khai bằng
`@Public()`. Dự án này chọn hướng ngược lại — mặc định mở, phải nhớ gắn `@AuthClaims()`. Hệ quả:
**quên gắn `@AuthClaims()` cho controller mới = endpoint đó mở toang cho mọi người**. Hãy nhớ kỹ khi
thêm module.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Logic xác thực viết một lần, dùng mọi nơi | Guard chạy DB (mục 23) → thêm độ trễ cho mỗi request |
| Đọc được metadata decorator → phân quyền tinh vi | Thứ tự guard quan trọng nhưng không có gì ép buộc |
| Chặn trước khi vào controller, code nghiệp vụ sạch | Mặc định "mở", quên gắn là hở bảo mật |
| Gắn/gỡ chỉ bằng một dòng | Test controller phải giả lập guard |

---

## 22. JWT & xác thực

### ① Nó là gì?

**JWT** (JSON Web Token) là một chuỗi ký tự dài chứng minh "tôi đã đăng nhập". Gồm 3 phần ngăn bởi
dấu chấm:

```
eyJhbGciOiJIUzI1NiJ9  .  eyJpZCI6MSwibmFtZSI6IkFkbWluIn0  .  4pcPyMD09olPSyXnrXCjTw
└─── header ────────┘    └─── payload (dữ liệu) ────────┘    └── signature (chữ ký) ──┘
```

- **header**: thuật toán ký.
- **payload**: dữ liệu bạn nhét vào — ở dự án này là `{ id, name }`.
- **signature**: chữ ký tạo từ header + payload + **một chuỗi bí mật** chỉ server biết.

🔑 **Điều quan trọng nhất cần hiểu**: payload chỉ được **mã hoá Base64**, tức là **ai cũng đọc
được** (dán token vào <https://jwt.io> là thấy hết). JWT **không giấu** thông tin — nó chỉ đảm bảo
thông tin **không bị sửa**, vì sửa một ký tự là chữ ký sai ngay.
→ **Tuyệt đối không đặt mật khẩu hay dữ liệu nhạy cảm vào payload.**

### ② Tại sao cần?

HTTP **không có trí nhớ**: mỗi request là một người lạ. Muốn biết ai đang gọi, có 2 cách:

| Cách | Cơ chế | Đánh đổi |
|---|---|---|
| **Session** | Server lưu bảng "phiên đăng nhập", client giữ id phiên trong cookie | Server phải nhớ → khó nhân bản nhiều máy chủ |
| **JWT** | Server **không nhớ gì**, mọi thông tin nằm trong token, chỉ cần xác minh chữ ký | Không thu hồi được token đã phát ra |

Dự án chọn JWT. Nhược điểm "không thu hồi được" được vá một phần bằng **refresh token** lưu trong DB.

### ③ Codebase này dùng ra sao?

**Toàn bộ luồng đăng nhập:**

```
① POST /api/v1/auth/login  { username: "admin", password: "123456" }
        │
        ├─► AuthService.validateUser()
        │     └─ usersService.findByUsername("admin")   → lấy user trong DB
        │     └─ bcrypt.compare("123456", user.password) → so mật khẩu với mã băm (mục 36)
        │     └─ sai → trả null → controller ném 401 "Invalid credentials"
        │
        └─► AuthService.login()
              ├─ payload = { id, name }                            ← chỉ 2 trường này
              ├─ accessToken  = jwtService.sign(payload, { expiresIn: '1y' })
              ├─ refreshToken = jwtService.sign({ sub: id }, { expiresIn: '30d' })
              │    └─ ghi 1 dòng vào bảng refresh_tokens
              └─ trả { accessToken, refreshToken, user }           ← user đã bỏ password

② Mọi request sau đó gửi kèm header:
        Authorization: Bearer eyJhbGciOi...

③ JwtAuthGuard chặn lại kiểm tra:
        const [type, token] = req.headers.authorization?.split(' ') ?? [];
        if (type !== 'Bearer') → 401
        payload = await jwtService.verifyAsync(token, { secret: 'yourSecretKey' });
        req.user = payload;        // ⭐ từ đây controller đọc được req.user.id, req.user.name
```

`VisitsController` chính là nơi hưởng thành quả của bước ③:

```ts
@Post()
create(@Req() req, @Body() createVisitDto: CreateVisitDto) {
  const { id, name } = req.user;                       // do JwtAuthGuard gắn vào
  return this.visitsService.create({ id, name }, createVisitDto);
}
```

Rồi `VisitsService` **chép** `creatorId` + `creatorName` vào bảng `visits` — để sau này biết ai đã
tạo lượt khám, kể cả khi nhân viên đó đã đổi tên hoặc nghỉ việc.

**Cấu hình JWT** ở `src/configs/jwt.options.ts`:

```ts
export const JwtOptions: JwtModuleAsyncOptions = {
  global: true,                                   // ⭐ JwtService tiêm được ở mọi module
  useFactory: async () => ({
    secret: 'yourSecretKey',
    signOptions: { expiresIn: '15m' },            // mặc định 15 phút...
  }),
};
```

...nhưng `login()` **ghi đè** thành `{ expiresIn: '1y' }`. Nên con số 15m gây hiểu nhầm.

**Refresh token** dùng để lấy access token mới mà không phải đăng nhập lại:

```
POST /auth/refresh { refreshToken }
   → tìm dòng trong bảng refresh_tokens (phải có và isActive)
   → verify chữ ký → lấy payload.sub = userId → tìm user
   → gọi lại login() → cấp cặp token mới

POST /auth/logout  (cần token)
   → prisma.refreshToken.deleteMany({ where: { userId } })   // xoá HẾT refresh token của user
```

⚠️ **Năm điểm yếu về bảo mật cần biết** (quan trọng nếu dự án sắp chạy thật):

1. **Secret ghi cứng `'yourSecretKey'`** và **lặp ở 2 nơi** — `configs/jwt.options.ts` và
   `guards/jwt-auth.guard.ts`. Nó nằm trong git, ai đọc được repo là ký được token giả. Phải chuyển
   sang biến môi trường và sửa **cả hai** chỗ cùng lúc.
2. **Access token sống 1 năm.** Lộ token = kẻ xấu vào được suốt một năm. Thông lệ: access token
   15–60 phút, dựa vào refresh token để gia hạn — đúng cơ chế mà dự án đã xây sẵn nhưng lại vô hiệu
   hoá bằng `1y`.
3. **`logout` không vô hiệu hoá access token** (JWT không thu hồi được), chỉ xoá refresh token. Đăng
   xuất xong, token cũ vẫn dùng được đến hết 1 năm.
4. **Refresh token lưu nguyên văn** trong DB. Lộ DB là lộ token.
5. **`passport` và `@nestjs/passport` được cài và `PassportModule` được import**, nhưng **không có
   strategy nào** được viết — guard tự đọc header thủ công. Ba thư viện này hiện là **thừa**.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Server không cần nhớ phiên → dễ chạy nhiều máy chủ | Không thu hồi được token đã phát |
| Xác minh nhanh, không cần truy vấn DB | Payload ai cũng đọc được — không nhét dữ liệu nhạy cảm |
| Hợp với mobile app, API bên thứ ba | Token dài, gửi kèm mọi request |
| Có sẵn cơ chế refresh trong dự án | Cấu hình hiện tại (secret cứng, 1 năm) khiến ưu điểm thành rủi ro |

---

## 23. Phân quyền & Reflector

### ① Nó là gì?

**Xác thực (authentication)** = "anh là ai" → mục 22.
**Phân quyền (authorization)** = "anh được làm gì" → mục này.

Mô hình dùng ở đây là **RBAC** (Role-Based Access Control):

```
User ──► UsersOnRoles ──► Role ──► RolesOnPermissions ──► Permission
admin      (bảng nối)     ADMIN        (bảng nối)      CREATE_CUSTOMER, GET_USERS, ...
```

Quyền không gán thẳng cho người, mà gán cho **vai trò**; người nhận vai trò.

**Reflector** là công cụ của NestJS để **đọc lại** metadata mà decorator đã dán lên hàm/class.

### ② Tại sao cần?

**Vì sao qua vai trò mà không gán thẳng?** Phòng khám có 20 nhân viên. Muốn "tất cả y tá được xem
khách hàng nhưng không được sửa giá thuốc": gán thẳng thì phải sửa 20 người, và tuyển người mới lại
phải nhớ gán đủ. Qua vai trò: sửa **một** dòng ở role `NURSE`, cả 20 người đổi theo.

**Vì sao cần Reflector?** Vì `@Permissions(CREATE_CUSTOMER)` chỉ *dán nhãn*. Phải có ai đó đọc nhãn
đó lúc chạy — đó là việc của Reflector trong `PermissionsGuard`.

### ③ Codebase này dùng ra sao?

**Bước 1 — dán nhãn.** `src/decorators/permissions.decorator.ts` gói `SetMetadata` cho gọn:

```ts
export const ROLES_KEY = 'permissions';                     // tên ngăn kéo để cất metadata
export const Permissions = (...permissions: PermissionNameType[]) =>
  SetMetadata(ROLES_KEY, permissions);
```

*(Tên biến `ROLES_KEY` trong khi giá trị là `'permissions'` là di sản đặt tên gây nhầm — nó lưu
**permission**, không phải role.)*

Dùng trong controller:

```ts
@Get()
@Permissions(PermissionNameType.GET_CUSTOMERS)      // dán nhãn: route này cần quyền GET_CUSTOMERS
findAll(@Query() filter?: FilterCustomerDto) { ... }
```

**Bước 2 — đọc nhãn và tra DB.** `src/guards/permissions.guard.ts`:

```ts
const requiredPermissions = this.reflector.getAllAndOverride<PermissionNameType[]>(
  ROLES_KEY,
  [context.getHandler(), context.getClass()],   // tìm trên HÀM trước, không có thì tìm trên CLASS
);

if (!requiredPermissions) return true;          // ⚠️ KHÔNG có @Permissions → CHO QUA
```

```ts
// Đi ngược chuỗi quan hệ trong MỘT câu truy vấn:
// permission nào thuộc về role nào mà role đó có user đang gọi?
const userPermissions = await this.prisma.permission.findMany({
  where: { permissionRoles: { some: { role: { roleUsers: { some: { userId: user.id } } } } } },
  select: { code: true },
});

const hasPermission = requiredPermissions.some((perm) => codes.includes(perm));
//                                        ↑ some = CHỈ CẦN MỘT quyền khớp là đủ
if (!hasPermission) throw new ForbiddenException('You do not have the required permissions');
```

**Ba hành vi phải nhớ:**

1. **Không có `@Permissions` = ai đăng nhập cũng qua.** Đây là lý do `VisitsController` — module
   nghiệp vụ quan trọng nhất — hiện **mở cho mọi user đã đăng nhập**. Có chủ ý hay bỏ sót thì nên
   hỏi lại team.
2. **`some` chứ không phải `every`**: `@Permissions(A, B)` nghĩa là "có A **HOẶC** B", không phải
   "có cả hai".
3. **Guard truy vấn DB ở MỌI request.** Với lưu lượng nhỏ của một phòng khám thì không sao, nhưng
   đây là chỗ tối ưu đầu tiên nếu chậm: cache quyền theo `userId`, hoặc nhét luôn danh sách quyền
   vào payload JWT (đổi lại: quyền chỉ cập nhật khi cấp token mới).

⚠️ **Truy vấn không lọc `isActive`** — vô hiệu hoá một `UsersOnRoles` bằng `isActive = false`
**không** làm mất quyền của user. Muốn thu hồi quyền phải xoá thật dòng đó.

**⭐ Thêm một quyền mới — quy trình 5 bước, thiếu bước nào cũng hỏng:**

```
1. prisma/schema.prisma                                  → thêm giá trị vào enum PermissionNameType
2. src/constants/permissions/permission-name-type.enum.ts → thêm ĐÚNG giá trị đó (TS enum riêng)
3. npx prisma migrate dev --name add_xxx_permission       → cập nhật enum trong Postgres
4. npx prisma db seed                                     → tạo dòng Permission + gán cho ADMIN
5. @Permissions(PermissionNameType.XXX) trên handler
```

Enum bị khai **hai lần** (một cho DB, một cho TypeScript) vì hai hệ thống khác nhau cần nó. Lệch
nhau → hoặc TypeScript không biết quyền mới, hoặc DB từ chối giá trị. Đây là điểm bảo trì dễ sai
nhất của codebase.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Đổi quyền cho cả nhóm chỉ bằng 1 dòng dữ liệu | Enum khai 2 nơi, phải nhớ đồng bộ tay |
| Quyền là **dữ liệu**, đổi không cần deploy lại | Truy vấn DB mỗi request, không cache |
| Nhìn decorator là biết route cần quyền gì | Mặc định "không nhãn = cho qua" dễ hở |
| Đủ tinh vi cho nhu cầu phòng khám | `some` (HOẶC) khác trực giác của nhiều người |
| | Chưa có phân quyền theo **dữ liệu** (kiểu "chỉ xem bệnh nhân của mình") |

---

## 24. Decorator tự viết

### ① Nó là gì?

NestJS cho phép **tự chế** decorator. Dự án dùng 2 trong 3 kiểu phổ biến:

| Kiểu | Công cụ | Ví dụ trong dự án |
|---|---|---|
| Gộp nhiều decorator thành một | `applyDecorators()` | `@AuthClaims()` |
| Gắn metadata để guard đọc | `SetMetadata()` | `@Permissions()` |
| Rút dữ liệu từ request ra tham số | `createParamDecorator()` | *(chưa dùng — nên có)* |

### ② Tại sao cần?

Vì cùng một bộ 3 decorator lặp lại ở **mọi** controller:

```ts
// Không có @AuthClaims — lặp ở 8 controller, sót một dòng là sai
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('customers')
export class CustomersController {}
```

Gộp lại thành một cái tên có ý nghĩa → ngắn hơn, và quan trọng hơn: **sửa một chỗ, áp dụng mọi nơi**.
Mai này thêm guard thứ ba (ví dụ kiểm tra chi nhánh), chỉ sửa `claims-auth.decorator.ts`.

### ③ Codebase này dùng ra sao?

**`@AuthClaims()`** — `src/decorators/claims-auth.decorator.ts`, đúng 8 dòng:

```ts
export function AuthClaims() {
  return applyDecorators(
    ApiBearerAuth(),                              // Swagger: hiện ổ khoá 🔒, cho nhập token
    UseGuards(JwtAuthGuard, PermissionsGuard),    // Nest: gắn 2 guard, đúng thứ tự
  );
}
```

Nó gắn liền hai việc lẽ ra dễ quên một: bảo vệ route **và** khai báo điều đó cho tài liệu API. Dùng
ở **mọi** controller trừ `AuthController` (chỉ dùng cho `logout`).

**`@Permissions(...)`** — xem mục 23.

**Thứ nên bổ sung: một param decorator lấy user đang đăng nhập.** Hiện tại `VisitsController` viết:

```ts
create(@Req() req, @Body() dto: CreateVisitDto) {
  const { id, name } = req.user;                  // req là any → không có gợi ý, không kiểm tra kiểu
  ...
}
```

Có thể gọn và an toàn hơn:

```ts
// src/decorators/current-user.decorator.ts
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  return ctx.switchToHttp().getRequest().user;
});

// dùng:
create(@CurrentUser() user: { id: number; name: string }, @Body() dto: CreateVisitDto) { ... }
```

Lợi: controller không còn chạm vào `req` thô, có kiểu rõ ràng, dễ test.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Sửa một chỗ, mọi controller đổi theo | Thêm một lớp gián tiếp: phải mở file mới biết `@AuthClaims` làm gì |
| Tên có nghĩa, đọc controller dễ hiểu ý đồ | Người mới không biết là có sẵn, dễ viết lại từ đầu |
| Không thể quên một mảnh của bộ decorator | Gộp quá tay thì mất tính linh hoạt |

---

## 25. Interceptor

### ① Nó là gì?

Lớp bọc **hai chiều** quanh controller: chạy một đoạn **trước**, rồi cho controller chạy, rồi chạy
tiếp một đoạn **sau** — và can thiệp được vào kết quả trả về.

```ts
intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
  // ... phần chạy TRƯỚC controller ...
  return next.handle().pipe(              // next.handle() = "cho controller chạy"
    map((res) => this.responseHandler(res, context)),   // ... phần chạy SAU, đổi kết quả ...
  );
}
```

`Observable` và `.pipe(map(...))` đến từ **RxJS**. Không cần học sâu RxJS để đọc code này: hiểu
`map(x => y)` là "lấy kết quả controller trả về, biến thành thứ khác" là đủ.

### ② Tại sao cần?

Cho những việc phải làm **giống nhau ở mọi endpoint, sau khi có kết quả**:

- Đóng gói response về một khuôn thống nhất ← **đúng việc dự án dùng**
- Đo thời gian xử lý
- Cache kết quả
- Loại bỏ trường nhạy cảm trước khi trả (`ClassSerializerInterceptor`)

Nếu không có, mọi service phải tự viết `return { message: 'Success', statusCode: 200, result: data }` —
30 chỗ, và chắc chắn có chỗ viết lệch.

### ③ Codebase này dùng ra sao?

Đăng ký **toàn cục** trong `src/app.module.ts`:

```ts
providers: [
  { provide: APP_INTERCEPTOR, useClass: ResponseInterceptor },
]
```

`APP_INTERCEPTOR` là token đặc biệt: Nest thấy nó thì hiểu "áp interceptor này cho **mọi** route".
Ưu điểm so với `app.useGlobalInterceptors(...)` trong `main.ts`: cách này vẫn được DI quản lý nên
interceptor tiêm được service khác vào nếu cần.

Việc nó làm — `src/interceptors/response.interceptor.ts`:

```ts
return {
  message: 'Success',        // ⚠️ ghi cứng
  statusCode: HttpStatus.OK, // ⚠️ ghi cứng = 200
  result: responseLog.response.body,   // ← dữ liệu thô mà service đã return
};
```

👉 Đây là lý do **bạn không bao giờ tự tạo phong bì trong service**. Cứ `return` dữ liệu thô.

**Bốn chi tiết cần biết:**

1. **`statusCode` trong body luôn là 200** — kể cả khi HTTP status thật là **201** (NestJS mặc định
   trả 201 cho `@Post`). Nghĩa là `POST /customers` trả về HTTP 201 nhưng body ghi `"statusCode": 200`.
   Frontend nên tin HTTP status thật, hoặc đơn giản là bỏ qua trường này.
2. **`message` luôn là `'Success'`**, không tuỳ chỉnh được từ service.
3. **Có một `LoggingModel` được dựng ra rồi vứt đi.** Interceptor thu thập ip, user-agent, path,
   body... vào biến `responseLog` nhưng **không ghi log ở đâu cả**, chỉ lấy lại `responseLog.response.body`.
   Đây là code dở dang — chỗ tự nhiên để cắm winston (mục 20) vào.
4. **`JSON.parse(JSON.stringify(res))`** — vòng chuyển đổi này khiến object `Date` bị biến thành
   **chuỗi ISO**, và sẽ **ném lỗi** nếu dữ liệu chứa `BigInt` hoặc tham chiếu vòng. Hiện chưa gây
   vấn đề vì Prisma trả `Float`/`Int`, nhưng cần biết nếu sau này dùng kiểu `Decimal`/`BigInt`.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Mọi API trả về cùng một khuôn, frontend viết 1 lần | `statusCode`/`message` ghi cứng, không phản ánh sự thật |
| Service không phải bận tâm định dạng | Thêm một lớp bọc: nhìn service không đoán được JSON cuối cùng |
| Áp toàn cục chỉ bằng 1 dòng khai báo | Swagger **không** biết về phong bì → tài liệu lệch thực tế (mục 33) |
| Có thể chạy cả trước lẫn sau controller | Dùng RxJS, thêm khái niệm mới cho người học |

---

## 26. Exception Filter

### ① Nó là gì?

Trạm cuối cùng bắt **mọi lỗi** được `throw` ra ở bất cứ đâu trong request, và biến nó thành một
response HTTP có khuôn thống nhất.

```ts
@Catch()                                            // ⭐ không tham số = bắt TẤT CẢ mọi loại lỗi
export class AllExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void { ... }
}
```

### ② Tại sao cần?

Không có nó, mỗi service phải tự bắt lỗi và tự dựng response:

```ts
try { ... } catch (e) { return res.status(400).json({ error: e.message }); }   // lặp 30 lần
```

Có nó, service chỉ cần **ném lỗi ra** và quên đi:

```ts
throw new BadRequestException('Customer not found');
```

Đây là một trong những điều làm code NestJS dễ chịu nhất: **luồng thành công và luồng lỗi tách hẳn
nhau**, hàm nào cũng chỉ viết đường đi đúng.

### ③ Codebase này dùng ra sao?

Đăng ký toàn cục, cùng chỗ với interceptor:

```ts
{ provide: APP_FILTER, useClass: AllExceptionFilter }
```

Logic đầy đủ của `src/filter-exceptions/exception.filter.ts`:

```ts
// 1. Lỗi có phải loại HTTP của Nest không?
const status = exception instanceof HttpException
  ? exception.getStatus()              // BadRequestException → 400, NotFound → 404...
  : HttpStatus.INTERNAL_SERVER_ERROR;  // lỗi lạ (lỗi Prisma, lỗi code) → 500

// 2. Lấy thông báo
const message = typeof errorResponse === 'object'
  ? (errorResponse as any).message || 'Error'
  : errorResponse;

// 3. Ghi log ra terminal
this.loggerTerminal.error(`HTTP Status: ${status} Error Message: ...`);

// 4. Trả về ĐÚNG khuôn 3 trường như lúc thành công
response.status(status).json({
  message: Array.isArray(message) ? message[0] : message,   // mảng lỗi validation → lấy cái đầu
  statusCode: status,
  result: null,
});
```

**Bảng các exception dựng sẵn của NestJS** (dùng `throw new ...` trong service):

| Class | HTTP | Dùng khi | Có trong dự án |
|---|---|---|---|
| `BadRequestException` | 400 | Dữ liệu sai, vi phạm luật nghiệp vụ | ✅ nhiều nhất |
| `UnauthorizedException` | 401 | Chưa đăng nhập / token hỏng | ✅ `JwtAuthGuard`, `AuthService` |
| `ForbiddenException` | 403 | Đăng nhập rồi nhưng không đủ quyền | ✅ `PermissionsGuard` |
| `NotFoundException` | 404 | Không tìm thấy tài nguyên | ❌ dự án dùng `BadRequestException` thay thế |
| `InternalServerErrorException` | 500 | Lỗi không lường trước | ✅ `VisitsService` |

Lưu ý cách dự án đang làm: `findOne(999)` với id không tồn tại **không** ném 404 — Prisma
`findUnique` trả `null`, service trả `null`, và client nhận
`{ message: 'Success', statusCode: 200, result: null }`. Thống nhất trong nội bộ dự án, nhưng khác
thông lệ REST; frontend phải tự kiểm tra `result === null`.

⚠️ **Hai điểm cần cải thiện:**

1. **Nuốt mất chi tiết lỗi 500.** Với lỗi không phải `HttpException`, filter chỉ log dòng tóm tắt
   chứ **không log stack trace**. Khi có bug thật ở production, bạn sẽ chỉ biết "500" mà không biết
   nó xảy ra ở dòng nào. Nên thêm `this.loggerTerminal.error(exception)` để in cả stack.
2. **Lỗi Prisma bị đẩy nguyên văn ra ngoài.** `VisitsService` gói lỗi bằng
   `new InternalServerErrorException(error)`, nên message gốc của Prisma (có thể chứa tên bảng, tên
   cột, thậm chí giá trị) lọt ra tới client. Nên trả thông báo chung chung cho client và giữ chi
   tiết trong log.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Lỗi và thành công cùng một khuôn → frontend viết 1 lần | Chỉ trả lỗi validation **đầu tiên** (`message[0]`) |
| Service chỉ cần `throw`, không quan tâm HTTP | Không log stack trace → khó gỡ lỗi 500 |
| Bắt được cả lỗi ngoài dự kiến, không để lộ stack cho client | Lỗi Prisma thô có thể lộ ra ngoài |
| Log tập trung một chỗ | Không phân biệt lỗi Prisma quen thuộc (P2002 trùng khoá) thành 400 |

---

## 27. Thứ tự thực thi đầy đủ

Đây là bản đồ để tra khi bạn tự hỏi *"code mình nên đặt ở đâu?"* hoặc *"vì sao chỗ này chưa có
`req.user`?"*.

```
     REQUEST đi vào
          │
    ┌─────▼──────────────────────────────────────────────────────────┐
    │ 1. MIDDLEWARE            LoggerMiddleware                      │  chưa biết handler nào sẽ chạy
    ├─────▼──────────────────────────────────────────────────────────┤
    │ 2. GUARDS                JwtAuthGuard → PermissionsGuard       │  đọc được decorator; gán req.user
    ├─────▼──────────────────────────────────────────────────────────┤
    │ 3. INTERCEPTORS (nửa TRƯỚC)   ResponseInterceptor              │  phần code trước next.handle()
    ├─────▼──────────────────────────────────────────────────────────┤
    │ 4. PIPES                 ValidationPipe                        │  JSON thô → DTO đã kiểm tra
    ├─────▼──────────────────────────────────────────────────────────┤
    │ 5. CONTROLLER  →  SERVICE  →  PRISMA  →  PostgreSQL            │  nghiệp vụ của bạn
    ├─────▼──────────────────────────────────────────────────────────┤
    │ 6. INTERCEPTORS (nửa SAU)     map(...) → bọc phong bì          │  đổi kết quả trả về
    └─────▼──────────────────────────────────────────────────────────┘
          │
     RESPONSE đi ra

    ⚡ Bất kỳ chỗ nào THROW  ──────►  7. EXCEPTION FILTER  ──────►  RESPONSE lỗi
                                        (bỏ qua mọi trạm còn lại)
```

*(Sơ đồ trong `01-TONG-QUAN.md` là bản rút gọn — nó bỏ qua "nửa trước" của Interceptor ở bước 3.
Bản trên đây mới là thứ tự đầy đủ và chính xác của NestJS.)*

**Ba hệ quả rút ra từ thứ tự này:**

| Quan sát | Vì sao |
|---|---|
| Guard **không** đọc được DTO đã kiểm tra | Guard (2) chạy **trước** Pipe (4) → chỉ thấy dữ liệu thô |
| Middleware **không** đọc được `@Permissions` | Middleware (1) chạy trước khi Nest chọn handler |
| Guard đọc được `@Permissions` | Guard nhận `ExecutionContext` → biết handler nào sắp chạy |
| `req.user` chỉ tồn tại từ bước 2 trở đi | `JwtAuthGuard` gán nó |
| Lỗi ở Guard vẫn ra đúng khuôn 3 trường | Filter (7) bắt lỗi từ **mọi** bước |

**Khi có nhiều cái cùng loại**, thứ tự là: **toàn cục → cấp controller → cấp phương thức**.
(Riêng exception filter thì ngược lại: cụ thể trước, toàn cục sau.)

**Bảng quyết định — nên viết code ở đâu:**

| Bạn muốn... | Đặt ở |
|---|---|
| Ghi log mọi request, thêm header, nén dữ liệu | **Middleware** |
| Chặn theo danh tính / quyền hạn | **Guard** |
| Đổi dạng dữ liệu trả về, đo thời gian, cache | **Interceptor** |
| Kiểm tra & ép kiểu dữ liệu đầu vào | **Pipe** + **DTO** |
| Ánh xạ URL → hàm, rút tham số ra | **Controller** |
| Luật nghiệp vụ, tính toán, gọi DB | **Service** ⭐ (99% code bạn viết nằm ở đây) |
| Đổi khuôn response lỗi | **Exception Filter** |

---
---

# Phần F — Quy ước trong dự án

> Phần này không phải kiến thức NestJS phổ quát, mà là **thoả thuận riêng của codebase này**. Bạn
> sẽ thấy chúng lặp lại y hệt ở mọi module — và code mới của bạn cũng nên theo, để người sau đọc
> một chỗ là hiểu mọi chỗ.

## 28. Pattern phân trang

### ① Nó là gì?

Không bao giờ trả về toàn bộ 10.000 khách hàng trong một response. Thay vào đó cắt thành **trang**:
`?page=2&pageSize=10` = "cho tôi 10 bản ghi, bắt đầu từ bản thứ 11".

### ② Tại sao cần?

- **Tốc độ**: 10.000 dòng JSON làm nặng DB, nặng mạng, treo trình duyệt.
- **Bộ nhớ**: cả server lẫn client đều phải nạp hết vào RAM.
- **Trải nghiệm**: không ai cuộn 10.000 dòng.

Client cần biết thêm **tổng số** để vẽ được thanh phân trang "1 2 3 ... 47" — đó là lý do mỗi lần
lấy danh sách phải chạy **hai** truy vấn: lấy dữ liệu **và** đếm tổng.

### ③ Codebase này dùng ra sao?

Pattern gồm 3 mảnh, lặp y hệt ở mọi module:

**Mảnh 1 — DTO dùng chung** (`src/dtos/pagination-params.dto.ts`):

```ts
export class PaginationWithSearchParamsDto extends SearchParamsDto {   // kế thừa trường `search`
  @IsOptional() @Transform(({ value }) => Number(value)) @IsNumber() @Min(1)
  page?: number;

  @IsOptional() @Transform(({ value }) => Number(value)) @IsNumber() @Min(1) @Max(100)
  pageSize?: number;                                    // ⭐ chặn trên 100, tránh bị "xin" 1 triệu bản ghi

  constructor() { super(); this.page = 1; this.pageSize = 10; }   // mặc định (xem mục 19)
}
```

Mọi filter DTO chỉ việc kế thừa:

```ts
export class FilterCustomerDto extends PaginationWithSearchParamsDto {
  constructor() { super(); }
}
```

**Mảnh 2 — Service: chạy song song 2 truy vấn:**

```ts
async getListCustomers(filter: FilterCustomerDto) {
  const [customers, total] = await Promise.all([      // ⭐ song song, không nối tiếp
    this.findAll(filter),                             // lấy 10 bản ghi
    this.count(filter),                               // đếm tổng
  ]);
  return makePaginationResponse(customers, filter.page, filter.pageSize, total);
}
```

`Promise.all` chạy hai truy vấn **cùng lúc**. Nếu viết tuần tự (`await` cái này rồi `await` cái kia)
thì tổng thời gian là tổng hai cái; chạy song song thì chỉ bằng cái chậm hơn.

**Mảnh 3 — Cắt trang trong `findAll` và đóng gói:**

```ts
skip: (page - 1) * pageSize,     // trang 1 → bỏ qua 0;  trang 3, size 10 → bỏ qua 20
take: pageSize,                  // lấy 10 dòng
```

```ts
// src/utils/common.util.ts
export function makePaginationResponse(data, page, pageSize, total) {
  return { page, pageSize, totalPage: Math.ceil(total / pageSize), total, data };
}
```

Kết quả cuối (sau khi interceptor bọc phong bì):

```jsonc
{
  "message": "Success",
  "statusCode": 200,
  "result": { "page": 1, "pageSize": 10, "totalPage": 5, "total": 47, "data": [ ... ] }
}
```

⚠️ **Bốn điều cần lưu ý:**

1. **`where` bị chép đôi.** `findAll` và `count` **phải** dùng **cùng một** điều kiện lọc, nếu không
   `total` sẽ không khớp với `data` và thanh phân trang sai. Ở `ProductsService`, `ServicesService`,
   `VisitsService` khối `where` đang bị **copy-paste hai lần** — sửa một chỗ quên chỗ kia là sinh
   bug. `RolesService`/`UsersService` làm đúng hơn: tách ra `private whereCondition(filter)` rồi cả
   hai cùng gọi. **Hãy theo cách của `RolesService`.**
2. **`CustomersService.findAll` là ngoại lệ**: nó viết SQL thô để sắp xếp theo "lần khám gần nhất"
   (`MAX(v.created_at)`), trong khi `count` vẫn dùng Prisma. Hệ quả nhìn thấy được: danh sách khách
   hàng trả về **tên cột snake_case** (`parent_phone`, `is_active`, `created_at`, thêm
   `latest_visit`), còn `GET /customers/:id` trả camelCase (`parentPhone`...). Frontend phải xử lý
   hai kiểu khác nhau cho cùng một thực thể. Đây là hệ quả trực tiếp của việc trộn `$queryRaw` với
   Prisma bình thường.
3. **`VisitsService.findAll`/`count` ghi cứng khoảng thời gian "hôm nay"** (`gte` đầu ngày,
   `lte` cuối ngày), nên danh sách lượt khám **không bao giờ trả về lượt khám của hôm qua**, dù bạn
   truyền `page` bao nhiêu. Có lẽ hợp với màn hình "hàng đợi khám hôm nay", nhưng nó là hành vi ẩn,
   không có tham số nào bật/tắt được.
4. **`PaginationParamsDto`** (bản không có `search`) hiện **không được dùng ở đâu**, và hai class
   trong file lặp lại y hệt phần `page`/`pageSize`. Có thể dọn lại cho gọn.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Một khuôn dùng cho mọi danh sách | `where` chép đôi ở nhiều service → dễ lệch |
| Client luôn biết `total`, `totalPage` để vẽ UI | Luôn tốn 2 truy vấn; `COUNT(*)` chậm trên bảng lớn |
| `@Max(100)` chặn được kiểu tấn công "xin hết dữ liệu" | Phân trang kiểu offset: trang thứ 10.000 rất chậm |
| Mặc định sẵn → client không truyền cũng chạy | Không có sắp xếp động (`?sortBy=`), thứ tự ghi cứng trong service |

---

## 29. Soft delete (`isActive`)

### ① Nó là gì?

**Không xoá thật.** Mọi bảng đều có cột `isActive Boolean @default(true)`. "Xoá" nghĩa là đặt
`isActive = false`, dòng dữ liệu vẫn nằm nguyên trong DB, chỉ là không hiện ra nữa.

### ② Tại sao cần?

1. **Toàn vẹn dữ liệu.** Xoá thật một `Product` đang được tham chiếu bởi 500 `PrescriptionItem` sẽ
   bị PostgreSQL từ chối (vi phạm khoá ngoại) — hoặc tệ hơn, làm hỏng đơn thuốc cũ.
2. **Lịch sử y tế.** Hồ sơ bệnh án phải giữ lại. Bác sĩ cần xem lại đơn thuốc 3 năm trước, kể cả khi
   loại thuốc đó đã ngừng bán.
3. **Sửa sai.** Lỡ tay "xoá" → bật lại một dòng dữ liệu, thay vì khôi phục backup.
4. **Kiểm toán.** Biết được ai từng tồn tại trong hệ thống.

### ③ Codebase này dùng ra sao?

**Khai báo** — lặp ở mọi model trong `schema.prisma`:

```prisma
isActive  Boolean  @default(true) @map("is_active")
createdAt DateTime @default(now()) @map("created_at")
updatedAt DateTime @default(now()) @updatedAt @map("updated_at")
```

**Truy vấn** — phải tự nhớ lọc:

```ts
const where = { isActive: true, ... };
```

**Không có endpoint DELETE thật.** Chỉ có hai cách "xoá":

| Cách | Ở đâu | Cơ chế |
|---|---|---|
| Sửa `isActive = false` qua `PATCH /:id` | users, roles, products, product-categories, services, service-categories | Trường `isActive` nằm trong `Update...Dto` |
| `DELETE /visits/:id` | visits | ⚠️ **không** đụng `isActive` — nó đặt `status = CANCELLED` |

```ts
cancelVisit(visitId: number) {
  return this.prismaService.visit.update({
    where: { id: visitId },
    data: { status: VisitStatus.CANCELLED },     // "xoá" theo nghĩa nghiệp vụ: huỷ lịch khám
  });
}
```

Cách này hợp lý hơn với nghiệp vụ: một lượt khám bị huỷ **vẫn cần thấy được** trong danh sách hôm
nay (để biết là đã huỷ), khác hẳn "biến mất".

⚠️ **Bốn cái bẫy của soft delete trong codebase này:**

1. **Lọc không nhất quán.** `CustomersService`, `ProductsService`, `ServicesService`, `VisitsService`
   đều lọc `isActive: true`. Nhưng `UsersService.whereCondition` và `RolesService.whereCondition`
   trả về `{}` khi không có từ khoá tìm kiếm → **`GET /users` và `GET /roles` trả về cả những bản
   ghi đã "xoá"**. Đây là bug thật, không phải chủ ý.
2. **`PermissionsGuard` không lọc `isActive`** (mục 23) — tắt `isActive` của một `UsersOnRoles`
   không thu hồi được quyền.
3. **Xung đột với ràng buộc `@@unique`.** Khách hàng "Nguyễn Văn An" + SĐT `0912345678` bị xoá mềm
   vẫn chiếm chỗ trong `@@unique([name, parentPhone])` → tạo lại đúng người đó sẽ báo
   *"Name And Parent phone number already exists"* mà nhìn danh sách chẳng thấy ai. Rất khó hiểu với
   người dùng. Cách xử lý phổ biến: dùng *partial unique index* (chỉ áp dụng khi `is_active = true`).
4. **`UpdateCustomerDto` không có trường `isActive`** → khách hàng hiện **không xoá mềm được** qua API.

**Khuyến nghị khi viết code mới**: mặc định luôn viết `where: { isActive: true, ... }`, trừ khi có
lý do rõ ràng để không. Prisma có tính năng *extension/middleware* để tự thêm điều kiện này cho mọi
truy vấn — đáng cân nhắc nếu team muốn tránh quên.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Không mất dữ liệu, khôi phục dễ | **Phải nhớ lọc `isActive` ở mọi truy vấn** — quên là lộ dữ liệu đã xoá |
| Không vỡ khoá ngoại, giữ được lịch sử | Bảng phình to mãi, không bao giờ nhỏ lại |
| Bắt buộc với dữ liệu y tế | Xung đột với ràng buộc `@@unique` |
| Đổi 1 cột, không cần bảng lưu trữ riêng | Không có gì ép buộc → dự án đang lọc không nhất quán |

---

## 30. Bố cục service

### ① Nó là gì?

Một quy ước **sắp xếp thứ tự phương thức** bên trong file service, để mở file nào bạn cũng biết
trước cái gì nằm ở đâu:

```ts
@Injectable()
export class XService {
  constructor(private prismaService: PrismaService) {}

  // ───── Nhóm 1: use-case công khai — khớp 1-1 với các hàm trong controller ─────
  async create(dto)             { ... }
  async getListXs(filter)       { ... }
  async findOne(id)             { ... }
  async update(id, dto)         { ... }

  // Repository methods  ← nhiều service ghi rõ comment này
  // ───── Nhóm 2: truy vấn thuần, không chứa luật nghiệp vụ ─────
  async findById(id)            { ... }
  async findByCode(code)        { ... }
  async findAll(filter)         { ... }
  async count(filter)           { ... }
}
```

### ② Tại sao cần?

- **Đọc nhanh.** Muốn biết API làm gì → đọc Nhóm 1. Muốn biết DB được truy vấn thế nào → đọc Nhóm 2.
- **Tách hai loại trách nhiệm.** Nhóm 1 = "luật của phòng khám" (không cho trùng, tính tổng tiền).
  Nhóm 2 = "cách lấy dữ liệu" (where, skip, take). Trộn lẫn thì hàm nào cũng dài và khó test.
- **Dùng lại.** `UsersService.findByUsername` (Nhóm 2) được `AuthService` gọi lại — nếu logic đó nằm
  lẫn trong `getListUsers` thì không tách ra dùng được.

### ③ Codebase này dùng ra sao?

Quy ước đặt tên khá nhất quán:

| Tên | Nhóm | Việc |
|---|---|---|
| `create(dto)` | 1 | Kiểm tra luật rồi ghi |
| `getListXs(filter)` | 1 | `Promise.all([findAll, count])` → `makePaginationResponse` |
| `findOne(id)` | 1 | Chi tiết một bản ghi (thường `include` quan hệ) |
| `update(id, dto)` | 1 | Kiểm tra tồn tại + luật rồi sửa |
| `findById` / `findByCode` / `findByUsername` | 2 | Tìm theo khoá duy nhất |
| `findAll(filter)` / `count(filter)` | 2 | Danh sách & đếm |
| `whereCondition(filter)` | 2 | Dựng điều kiện lọc dùng chung |

Ví dụ điển hình về ranh giới giữa hai nhóm — `RolesService`:

```ts
// Nhóm 1: có LUẬT NGHIỆP VỤ
async create(createRoleDto: CreateRoleDto) {
  const createdCode = convertTextToCode(createRoleDto.name);   // luật: code sinh từ tên
  const existed = await this.findByCode(createdCode);          // gọi Nhóm 2
  if (existed) throw new BadRequestException('Role existed');  // luật: không trùng
  return this.prismaService.role.create({ data: { ...createRoleDto, code: createdCode } });
}

// Nhóm 2: KHÔNG có luật, chỉ hỏi DB
async findByCode(code: string) {
  return this.prismaService.role.findUnique({ where: { code } });
}
```

**Ba điểm chưa nhất quán, để bạn không bối rối khi thấy:**

- Chỉ một số service ghi comment `// Repository methods`; số khác thì không, dù vẫn xếp đúng thứ tự.
- `whereCondition` chỉ có ở `UsersService`/`RolesService`; các service khác chép `where` hai lần
  (mục 28).
- Một số hàm có `async` mà không có `await` bên trong (ví dụ `findOne` chỉ `return` thẳng Promise).
  Không sai — `async` chỉ bọc kết quả vào Promise — nhưng thừa. Trong dự án tồn tại cả hai kiểu
  (`VisitsService.findOne` không `async`, `UsersService.findOne` có `async`).

**Bước tiến hoá tiếp theo** (khi service phình to): tách hẳn Nhóm 2 ra một class `XRepository` riêng.
Lợi: service không còn biết Prisma là gì, test dễ hơn hẳn. Chi phí: thêm một tầng file. Với quy mô
hiện tại của dự án thì comment `// Repository methods` là đủ, chưa cần tách.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Mở service nào cũng đoán được cấu trúc | Chỉ là quy ước, không có gì ép buộc (lint không kiểm tra) |
| Luật nghiệp vụ và truy vấn tách bạch | Hiện đang áp dụng không đều giữa các module |
| Hàm Nhóm 2 dùng lại được ở service khác | Ranh giới đôi khi mờ (`findOne` gọi thẳng `findById`) |
| Là bước chuẩn bị tốt để tách repository sau này | Service vẫn phụ thuộc trực tiếp Prisma |

---
---

# Phần G — Công cụ

## 31. Docker & docker-compose

### ① Nó là gì?

**Docker** đóng gói một chương trình **cùng toàn bộ môi trường của nó** (hệ điều hành thu nhỏ, thư
viện hệ thống, phiên bản Node) thành một **image**. Chạy image lên thì được một **container** — một
máy tính ảo nhẹ, cách ly khỏi máy bạn.

**docker-compose** mô tả **nhiều container** cùng lúc trong một file YAML và bật tất cả bằng một lệnh.

Ba từ cần phân biệt:

| Từ | Ví von |
|---|---|
| **Image** | Bản thiết kế / đĩa cài |
| **Container** | Máy đang chạy từ bản thiết kế đó |
| **Volume** | Ổ cứng gắn ngoài — dữ liệu sống sót khi container bị xoá |

### ② Tại sao cần?

Không có Docker, người mới vào dự án phải: cài PostgreSQL 15 đúng phiên bản, tạo user, tạo database,
cài Node 20 (trong khi máy đang có Node 18 cho dự án khác)... Mỗi máy một kiểu, và câu
*"máy tôi chạy được mà"* bắt đầu xuất hiện.

Có Docker: `make init-dev` — xong. Máy bạn không cần cài Postgres, và xoá đi cũng không để lại rác.

### ③ Codebase này dùng ra sao?

`docker-compose.yml` khai **2 dịch vụ**:

```yaml
services:
  backend:
    container_name: nestjs_backend
    build: { context: ./, dockerfile: Dockerfile }
    tty: true                    # ⭐ giữ container sống dù không chạy lệnh nào
    working_dir: /app
    volumes:
      - ./:/app                  # ⭐ gắn thư mục dự án vào container → sửa code là container thấy ngay
      - /app/node_modules        # ⭐ TRỪ node_modules ra (xem giải thích bên dưới)
    ports: [ '${BACKEND_PORT}:9100' ]     # cổng máy bạn : cổng trong container
    env_file: [ .env ]
    depends_on: [ postgres ]

  postgres:
    image: postgres:15           # dùng image có sẵn, không cần build
    container_name: postgres_db
    ports: [ '${POSTGRES_PORT}:5432' ]
    volumes: [ postgres_data:/var/lib/postgresql/data ]   # ⭐ dữ liệu DB nằm ở volume
```

**Bốn chi tiết quan trọng:**

1. **Container backend cố ý KHÔNG tự chạy app.** `Dockerfile` có dòng `CMD` bị comment lại, compose
   cũng không khai `command`. Nó sống nhờ `tty: true`. Bạn phải:
   ```bash
   make connect        # docker exec -it nestjs_backend bash → chui vào trong
   yarn start:dev      # rồi tự chạy app
   ```
   Đây **không phải lỗi** — cách này tiện khi phát triển: chạy migrate, seed, thử lệnh, restart app
   mà không phải dựng lại container. Nhưng để triển khai thật thì phải thêm `CMD` đàng hoàng.

2. **`- /app/node_modules` — dòng khó hiểu nhất.** Dòng trên (`./:/app`) ghi đè toàn bộ `/app` trong
   container bằng thư mục trên máy bạn, **kể cả `node_modules`**. Mà `node_modules` của bạn được cài
   trên macOS/Windows, còn container là Linux — các thư viện biên dịch sẵn (bcrypt, prisma engine)
   sẽ **không chạy được**. Dòng thứ hai tạo một volume vô danh đè lên đúng thư mục đó, giữ nguyên
   `node_modules` mà container đã tự cài lúc build. Bỏ dòng này đi là app trong container sập ngay.

3. **Hai lớp cổng, rất dễ nhầm:**
   ```
   Trình duyệt → localhost:9999 (BACKEND_PORT) → container:9100 (ghi cứng trong main.ts)
   psql/DBeaver → localhost:5439 (POSTGRES_PORT) → container:5432
   ```
   Bên trong mạng Docker, các container gọi nhau bằng **tên dịch vụ** và **cổng gốc**:
   `postgres:5432`. Từ máy bạn thì phải dùng `localhost:5439`. Đây chính là gốc rễ của cái bẫy
   `DATABASE_HOST` ở mục 32.

4. **`depends_on` chỉ đảm bảo *thứ tự khởi động*, không đảm bảo Postgres đã *sẵn sàng nhận kết nối*.**
   Bật lên chạy `prisma migrate` ngay có thể gặp lỗi "connection refused" — đợi vài giây rồi thử lại.

**Các lệnh trong `Makefile`** (Makefile chỉ là bảng viết tắt cho lệnh dài):

```makefile
init-dev:   docker compose up --build -d       # build image + bật 2 container ở nền
connect:    docker exec -it nestjs_backend bash # vào shell container backend
db-connect: docker exec -it postgres_db psql -U postgres_user -d postgres
remove:     docker compose down -v              # ⚠️ -v = XOÁ VOLUME = MẤT SẠCH DỮ LIỆU DB
```

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Môi trường giống hệt nhau trên mọi máy | Thêm một lớp khái niệm nữa cho người mới |
| Không phải cài Postgres lên máy thật | Ăn RAM/ổ đĩa, chậm hơn chạy trực tiếp (nhất là trên macOS) |
| Bật/xoá toàn bộ môi trường bằng 1 lệnh | Gỡ lỗi khó hơn: lỗi ở máy bạn hay trong container? |
| Bind mount → sửa code là thấy ngay, không cần build lại | `make remove` xoá dữ liệu, chạy nhầm là mất hết |

---

## 32. Biến môi trường (.env)

### ① Nó là gì?

File `.env` chứa các cặp `TÊN=giá_trị` để cấu hình app **từ bên ngoài code**:

```dotenv
DATABASE_PASSWORD=postgres_password
BACKEND_PORT=9999
```

Trong code đọc ra bằng `process.env.TÊN`.

### ② Tại sao cần?

1. **Không nhét bí mật vào git.** Mật khẩu DB, khoá API mà commit lên là ai cũng đọc được — và
   lịch sử git thì gần như không xoá sạch được.
2. **Một bộ code, nhiều môi trường.** Máy bạn dùng DB local, production dùng DB trên cloud — cùng
   một image, chỉ khác biến môi trường.

`.gitignore` của dự án đã chặn `.env`. Thay vào đó, `.env.example` **được commit** làm khuôn mẫu —
liệt kê đủ tên biến với giá trị giả. Người mới chỉ cần `cp .env.example .env`.

### ③ Codebase này dùng ra sao?

```dotenv
BACKEND_PORT=9999            # cổng trên máy bạn, map vào 9100 của container
POSTGRES_PORT=5439           # cổng trên máy bạn, map vào 5432 của container

DATABASE_HOST=localhost      # ⚠️ khai 2 lần!
DATABASE_HOST=postgres       # ⚠️ dòng SAU thắng
DATABASE_NAME=postgres
DATABASE_USER=postgres_user
DATABASE_PASSWORD=postgres_password
DATABASE_PORT=5432

DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public"
```

**`DATABASE_URL`** là biến duy nhất Prisma thật sự đọc (`datasource db { url = env("DATABASE_URL") }`).
Nó được **ghép** từ các biến phía trên bằng cú pháp `${...}` — cơ chế này do bộ nạp `.env` của
Prisma thực hiện khi bạn chạy `npx prisma ...`.

⚠️ **Cái bẫy `DATABASE_HOST` khai hai lần** — đây là thứ làm mất thời gian của mọi người mới:

| Chạy ở đâu | `DATABASE_HOST` đúng phải là | `DATABASE_PORT` đúng phải là |
|---|---|---|
| **Trong container** (`make connect` rồi chạy) | `postgres` (tên dịch vụ trong compose) | `5432` |
| **Trên máy thật** (chạy `yarn start:dev` trực tiếp) | `localhost` | `5439` (= `POSTGRES_PORT`) |

Vì dòng sau đè dòng trước, file mẫu đang cấu hình cho **trong Docker**. Chạy trên máy thật mà không
sửa sẽ gặp lỗi `getaddrinfo ENOTFOUND postgres` — máy bạn không biết `postgres` là ai.

⚠️ **`PORT = 9100` bị ghi cứng trong `src/main.ts`**, không đọc từ `.env`. Cùng với danh sách CORS
cũng ghi cứng, đây là hai chỗ đáng chuyển sang biến môi trường đầu tiên:

```ts
const PORT = 9100;                                    // hiện tại
const PORT = Number(process.env.PORT) || 9100;        // nên là
```

Dự án chưa dùng `@nestjs/config` (module chuẩn của NestJS để đọc và **kiểm tra** biến môi trường).
Với dự án lớn hơn thì rất nên thêm, vì nó chặn được lỗi "thiếu biến môi trường" ngay lúc khởi động
thay vì lúc gọi API.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Bí mật không nằm trong git | Không có kiểm tra: gõ sai tên biến → `undefined` âm thầm |
| Một bộ code chạy được nhiều môi trường | Người mới hay quên `cp .env.example .env` |
| `.env.example` là tài liệu sống về cấu hình | File hiện tại có bẫy `DATABASE_HOST` khai 2 lần |
| Đổi cấu hình không cần build lại | `PORT` và CORS vẫn ghi cứng → chưa đạt mục tiêu |

---

## 33. Swagger

### ① Nó là gì?

Trang web **tự sinh** liệt kê toàn bộ API, kèm mô tả tham số, ví dụ, và nút **"Try it out"** để gọi
thử ngay trong trình duyệt. Chuẩn đằng sau tên là **OpenAPI**.

Địa chỉ: <http://localhost:9999/swagger>

### ② Tại sao cần?

Tài liệu API viết tay luôn **lạc hậu** so với code — không ai nhớ cập nhật file Word sau khi đổi
tham số. Swagger đọc thẳng từ code (decorator trên controller và DTO), nên nó **luôn khớp** với API
thật.

Ngoài ra: người làm frontend tự thử API mà không cần cài Postman, không cần hỏi backend từng trường.

### ③ Codebase này dùng ra sao?

Bật trong `src/main.ts`:

```ts
const options = new DocumentBuilder()
  .setTitle('O2 SKIN API')                        // ⚠️ sót từ dự án cũ — nên đổi thành Thao Nhi Clinic
  .setDescription('NestJS application for O2 Skin Backend')
  .setVersion('1.0')
  .addBearerAuth()                                // ⭐ hiện nút "Authorize" để dán token
  .build();

SwaggerModule.setup('swagger', app, SwaggerModule.createDocument(app, options));
```

Ba decorator nuôi dữ liệu cho nó:

| Decorator | Ở đâu | Tác dụng |
|---|---|---|
| `@ApiTags('Customer')` | Trên controller | Gom nhóm route trong trang |
| `@ApiProperty({ example, required, enum })` | Trên từng trường DTO | Sinh ví dụ + đánh dấu bắt buộc |
| `@ApiBearerAuth()` | Qua `@AuthClaims()` | Hiện ổ khoá 🔒, gắn token vào request thử |

**Cách dùng để học codebase — làm ngay khi mới vào dự án:**

```
1. Mở http://localhost:9999/swagger
2. Auth → POST /auth/login → Try it out → { "username": "admin", "password": "123456" } → Execute
3. Copy giá trị accessToken trong kết quả
4. Bấm nút "Authorize" 🔒 góc trên phải → dán token → Authorize
5. Giờ thử được mọi API khác. Vừa thử vừa nhìn terminal xem Prisma sinh SQL gì (mục 15).
```

⚠️ **Ba hạn chế của Swagger trong dự án này:**

1. **Không mô tả phong bì response.** Swagger hiển thị kiểu dữ liệu do controller `return`, nhưng
   thực tế `ResponseInterceptor` bọc thêm `{ message, statusCode, result }` (mục 25). Nên phần
   "Response" trên trang tài liệu **không khớp** JSON thật. Muốn khớp phải khai thêm `@ApiOkResponse`
   với một DTO bọc — dự án chưa làm.
2. **Không có DTO đầu ra**, nên phần mô tả kết quả gần như trống.
3. **Tiêu đề vẫn là "O2 SKIN API"** — sót lại từ dự án khác, gây bối rối.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Tài liệu luôn khớp code, không cần bảo trì tay | Phải rải `@ApiProperty` lên từng trường DTO |
| Thử API ngay trong trình duyệt | Không mô tả được phong bì response nếu không khai thêm |
| Frontend tự phục vụ, giảm hỏi đáp | Nếu mở công khai ở production sẽ lộ toàn bộ bề mặt API |
| Sinh được code client tự động từ OpenAPI | Ví dụ (`example`) là do người viết bịa, có thể sai thực tế |

---

## 34. ESLint & Prettier

### ① Chúng là gì?

Hai công cụ **khác nhau**, hay bị gộp làm một:

| Công cụ | Lo chuyện | Ví dụ |
|---|---|---|
| **Prettier** | **Hình thức** — dấu cách, xuống dòng, nháy đơn/kép | tự bẻ dòng dài, thêm dấu phẩy cuối |
| **ESLint** | **Nội dung** — mẫu code dễ sinh lỗi | biến khai mà không dùng, `any` bừa bãi |

Nói ngắn: Prettier lo *code trông thế nào*, ESLint lo *code viết có ổn không*.

### ② Tại sao cần?

- **Hết tranh cãi vô nghĩa.** Không ai phải bàn "2 hay 4 dấu cách" nữa — máy quyết.
- **Diff git sạch.** Không có commit nào chỉ toàn thay đổi khoảng trắng.
- **Bắt lỗi ngớ ngẩn sớm.** Biến thừa, `await` quên, so sánh `==` thay vì `===`.

### ③ Codebase này dùng ra sao?

```bash
yarn format   # prettier --write "src/**/*.ts"  → sắp xếp lại hình thức
yarn lint     # eslint "{src,apps,libs,test}/**/*.ts" --fix  → sửa được gì thì tự sửa
```

`.prettierrc` — chỉ 2 luật, phần còn lại theo mặc định:

```json
{ "singleQuote": true, "trailingComma": "all" }
```

`.eslintrc.js` — dùng bộ luật khuyến nghị của TypeScript, cộng `plugin:prettier/recommended` (để
Prettier và ESLint không đánh nhau), và **tắt 4 luật**:

```js
'@typescript-eslint/no-explicit-any': 'off',              // ⚠️ cho phép dùng `any` thoải mái
'@typescript-eslint/explicit-function-return-type': 'off', // không bắt khai kiểu trả về
'@typescript-eslint/explicit-module-boundary-types': 'off',
'@typescript-eslint/interface-name-prefix': 'off',
```

Tắt `no-explicit-any` giải thích vì sao trong code có `@Req() req: any` và `convertTextToCode(text)`
không kiểu. Dễ viết, nhưng mất kiểm tra kiểu ở đúng chỗ dữ liệu từ ngoài đi vào.

Bạn cũng sẽ thấy dòng này rải rác — cách **tắt luật cho đúng một dòng**:

```ts
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { password, ...result } = user;      // `password` cố ý khai ra để loại bỏ, không dùng tới
```

⚠️ **Không có gì tự động chạy hai lệnh này.** Không có git hook (husky/lint-staged), không có CI.
Chúng chỉ chạy khi bạn tự gõ. Thói quen nên có trước mỗi lần commit:

```bash
yarn format && yarn lint && yarn build
```

(`yarn build` để **kiểm tra kiểu** — điều mà `yarn start:dev` bỏ qua, xem mục 3.)

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Cả team ra code trông giống nhau | Không tự chạy → phụ thuộc kỷ luật cá nhân |
| Diff git chỉ chứa thay đổi thật | Chạy `format` lần đầu trên file cũ tạo diff khổng lồ |
| Bắt được lỗi tiềm ẩn trước khi chạy | Tắt `no-explicit-any` làm mất một lớp bảo vệ |
| `--fix` tự sửa phần lớn vi phạm | ESLint có thể chậm trên dự án lớn |

---

## 35. Jest

### ① Nó là gì?

Thư viện **kiểm thử tự động**: bạn viết code để kiểm tra code. Một bài test có 3 phần:

```ts
describe('RolesService', () => {                      // nhóm test
  it('nên báo lỗi khi role đã tồn tại', async () => { // một tình huống
    // Arrange (chuẩn bị) → Act (chạy) → Assert (khẳng định)
    await expect(service.create({ name: 'Admin' })).rejects.toThrow(BadRequestException);
  });
});
```

Hai loại chính:

| Loại | Kiểm tra | Tốc độ |
|---|---|---|
| **Unit test** | Một hàm/service riêng lẻ, các phụ thuộc đều **giả** (mock) | Rất nhanh |
| **E2E test** | Cả app: gửi HTTP thật, chạm DB thật | Chậm, nhưng sát thực tế |

### ② Tại sao cần?

- **Sửa code mà không sợ.** Test xanh = những gì từng chạy đúng vẫn chạy đúng.
- **Test là tài liệu.** Đọc test biết hàm được kỳ vọng cư xử ra sao trong ca lỗi.
- **Nhanh hơn thử tay.** Không phải mở Swagger bấm lại 20 API sau mỗi lần sửa.

### ③ Codebase này dùng ra sao?

Cấu hình nằm trong `package.json`:

```jsonc
"jest": {
  "rootDir": "src",                 // chỉ tìm test trong src/
  "testRegex": ".*\\.spec\\.ts$",   // file kết thúc bằng .spec.ts
  "transform": { "^.+\\.(t|j)s$": "ts-jest" }   // hiểu TypeScript
}
```

⚠️ **Hiện tại dự án CHƯA CÓ file test nào.** `yarn test` chạy xong báo "no tests found". Và
`yarn test:e2e` trỏ tới `./test/jest-e2e.json` — file **không tồn tại** → lệnh này lỗi ngay.

⚠️ **Một cái bẫy chờ sẵn**: cấu hình jest **thiếu `moduleNameMapper`** cho các alias `@n-*`. Bài test
đầu tiên nào import `@n-utils` hay `@n-dtos` sẽ lỗi `Cannot find module`. Phải thêm:

```jsonc
"moduleNameMapper": {
  "^@n-utils$": "<rootDir>/utils/index.ts",
  "^@n-dtos$":  "<rootDir>/dtos/index.ts"
  // ... các alias còn lại
}
```

**Bài test đầu tiên nên viết như thế nào** — nhờ DI (mục 8), bạn thay `PrismaService` thật bằng đồ
giả, không cần database:

```ts
// src/modules/roles/roles.service.spec.ts
import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { PrismaService } from 'prisma/prisma.service';

describe('RolesService.create', () => {
  let service: RolesService;
  const prismaMock = { role: { findUnique: jest.fn(), create: jest.fn() } };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: PrismaService, useValue: prismaMock },   // ⭐ tiêm bản GIẢ vào
      ],
    }).compile();
    service = moduleRef.get(RolesService);
  });

  it('ném lỗi khi code đã tồn tại', async () => {
    prismaMock.role.findUnique.mockResolvedValue({ id: 1, code: 'Admin' });
    await expect(service.create({ name: 'Admin' } as any)).rejects.toThrow(BadRequestException);
  });
});
```

**Nên test cái gì trước** (theo thứ tự đáng giá nhất trong dự án này):

1. `convertTextToCode` — hàm thuần, không phụ thuộc gì, test cực dễ (`"Thuốc Ho" → "ThuocHo"`).
2. `makePaginationResponse` — cũng là hàm thuần, có nhánh `pageSize` rỗng.
3. Các nhánh ném lỗi trong service (`create` khi trùng, `update` khi không tìm thấy).
4. `VisitsService.updateVisitInfo` — phức tạp nhất, nhiều rủi ro nhất, nhưng cũng khó mock nhất.

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Sửa code tự tin, phát hiện hồi quy sớm | Viết test tốn thời gian, và dự án đang là con số 0 |
| DI làm cho việc mock rất dễ | Mock nhiều quá thì test không còn phản ánh thực tế |
| Test là tài liệu sống về hành vi mong đợi | Cấu hình jest hiện thiếu alias, `test:e2e` đang hỏng |
| Chạy nhanh, tích hợp CI dễ | Test qua Prisma thật cần DB riêng cho test |

---

## 36. bcrypt

### ① Nó là gì?

Thuật toán **băm (hash) mật khẩu**. Băm khác mã hoá ở chỗ: **một chiều, không giải ngược được**.

```
"123456" ──bcrypt.hash──► "$2b$10$N9qo8uLOickgx2ZMRZoMye..."
                           └┬┘└┬┘└──────────┬───────────┘
                          thuật  số vòng   salt + kết quả băm
                          toán    (10)
```

Kiểm tra mật khẩu **không phải** bằng cách giải ngược, mà là băm lại chuỗi người dùng nhập rồi so
sánh — đó chính là việc `bcrypt.compare` làm.

### ② Tại sao cần?

**Không bao giờ lưu mật khẩu dạng nguyên văn.** Nếu DB bị lộ (hack, backup rơi ra ngoài, nhân viên
cũ tải về), kẻ xấu không chỉ có mật khẩu của hệ thống này — họ có mật khẩu mà người dùng **dùng lại
ở Gmail, ngân hàng**.

Vì sao là bcrypt mà không phải MD5/SHA-256? Vì bcrypt **cố tình chậm**. MD5 băm được hàng tỉ chuỗi
mỗi giây trên GPU → dò mật khẩu yếu trong vài phút. bcrypt với `rounds = 10` mất ~100ms mỗi lần →
cùng cuộc tấn công đó cần hàng nghìn năm. Người dùng chờ 100ms lúc đăng nhập là không đáng kể, kẻ
tấn công thì bó tay.

bcrypt còn tự sinh **salt** (chuỗi ngẫu nhiên) cho mỗi mật khẩu, nên hai người cùng đặt `123456`
vẫn ra hai chuỗi băm khác nhau — vô hiệu hoá bảng tra sẵn (rainbow table).

### ③ Codebase này dùng ra sao?

**Lúc seed — băm đúng cách:**

```ts
// prisma/seed.ts
const passwordHash1 = await bcrypt.hash('123456', 10);   // 10 = số vòng (cost factor)
await prisma.user.upsert({ ..., create: { username: 'admin', password: passwordHash1 } });
```

**Lúc đăng nhập — so sánh đúng cách:**

```ts
// AuthService.validateUser
const user = await this.usersService.findByUsername(username);
if (user && (await bcrypt.compare(password, user.password))) {
  const { password, ...result } = user;    // bỏ mã băm ra khỏi dữ liệu trả về
  return result;
}
return null;                               // → controller ném 401 'Invalid credentials'
```

🐞 **BUG THẬT SỰ, cần biết ngay:** `UsersService.create` **không băm mật khẩu**:

```ts
const result = await this.prismaService.user.create({
  data: { ...userInfo, ... },      // userInfo.password là chuỗi NGUYÊN VĂN
});
```

Hệ quả kép:
1. Mật khẩu nằm nguyên văn trong DB — lỗi bảo mật.
2. `bcrypt.compare("123456", "123456")` trả `false` (vì vế sau không phải chuỗi băm hợp lệ) →
   **user tạo qua `POST /api/v1/users` không bao giờ đăng nhập được**. Chỉ hai tài khoản do seed
   tạo mới dùng được.

Cách sửa (2 dòng):

```ts
async create(createUserDto: CreateUserDto) {
  const { roleIds, ...userInfo } = createUserDto;
  // ... kiểm tra trùng username ...
  const hashedPassword = await bcrypt.hash(userInfo.password, 10);
  return this.prismaService.user.create({ data: { ...userInfo, password: hashedPassword, ... } });
}
```

Liên quan: `UpdateUserDto` dùng `OmitType(CreateUserDto, ['password'])` nên **không có API đổi mật
khẩu** nào cả. Nếu bổ sung, nhớ băm ở đó nữa.

*(Trong cùng hàm `create` còn một lỗi thứ hai không liên quan tới bcrypt: `UsersOnRoles.connect` /
`.set` đang nhận `roleIds` như thể chúng là id của **dòng bảng nối**, chứ không phải id của `Role`.
Gán vai trò khi tạo user vì thế cũng không hoạt động như mong đợi.)*

### ④ Ưu & nhược

| Ưu | Nhược |
|---|---|
| Chuẩn công nghiệp, đã được kiểm chứng lâu năm | Chậm có chủ đích → không dùng để băm dữ liệu lớn |
| Tự sinh salt, chống rainbow table | Là thư viện native → phải cài lại khi đổi hệ điều hành (lý do có `- /app/node_modules` ở mục 31) |
| Chỉnh được độ khó bằng số vòng, tăng dần theo thời gian | Giới hạn 72 byte đầu của mật khẩu |
| API đúng 2 hàm: `hash` và `compare` | Dự án **đang dùng sai ở `UsersService.create`** |

---
---

## Đọc tiếp

- Chưa nắm bức tranh lớn? → [`01-TONG-QUAN.md`](./01-TONG-QUAN.md)
- Chạy dự án, danh sách endpoint, biến môi trường → [`../README.md`](../README.md)
- Quy ước dành cho công cụ AI khi sửa repo này → [`../CLAUDE.md`](../CLAUDE.md)

### Bảng tra nhanh: gặp file này thì đọc mục nào

| Bạn đang mở file... | Đọc mục |
|---|---|
| `prisma/schema.prisma` | 11, 12, 13 |
| `prisma/seed.ts` | 14, 36 |
| `src/main.ts` | 5, 19, 27, 32, 33 |
| `src/app.module.ts` | 7, 8, 20, 25, 26 |
| `src/modules/*/*.controller.ts` | 6, 9, 17, 21, 24 |
| `src/modules/*/*.service.ts` | 10, 11, 28, 29, 30 |
| `src/modules/*/dto/*.ts` | 17, 18, 19, 28 |
| `src/guards/*.ts` | 21, 22, 23 |
| `src/interceptors/response.interceptor.ts` | 25, 27 |
| `src/filter-exceptions/exception.filter.ts` | 26, 27 |
| `src/modules/visits/visits.service.ts` | 16, 22, 28 |
| `docker-compose.yml`, `Makefile`, `.env` | 31, 32 |
