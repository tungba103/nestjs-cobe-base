# Tổng quan codebase (dành cho người mới)

> File này giải thích **bức tranh lớn**: dự án này là gì, các mảnh ghép nối với nhau ra sao,
> và một request đi qua hệ thống như thế nào.
> Muốn hiểu **chi tiết từng thành phần** (nó là gì, tại sao cần, ưu/nhược điểm) → đọc
> [`02-CHI-TIET-THANH-PHAN.md`](./02-CHI-TIET-THANH-PHAN.md).
>
> Giả định: bạn mới chỉ viết "hello world" bằng Node.js. Mọi thứ sẽ được giải thích từ đầu.

---

## 1. Dự án này là gì?

Đây là phần **backend** (máy chủ) của một phần mềm quản lý **phòng khám nhi**.

Nghiệp vụ thực tế nó phục vụ:

1. Lễ tân đăng nhập vào hệ thống.
2. Bệnh nhân (trẻ em) đến khám → lễ tân tạo **hồ sơ khách hàng** (`Customer`), gồm tên bé, ngày sinh, tên và SĐT phụ huynh.
3. Mỗi lần bé đến khám → tạo một **lượt khám** (`Visit`).
4. Bác sĩ khám, ghi vào lượt khám: triệu chứng, chẩn đoán, tiền sử bệnh, lời dặn.
5. Bác sĩ kê **đơn thuốc** (`Prescription`) gồm nhiều loại thuốc (`Product`), mỗi loại ghi rõ liều sáng/trưa/chiều/tối.
6. Bác sĩ chỉ định **dịch vụ** đã dùng (`ServiceUsage`) như siêu âm, xét nghiệm... (`Service`).
7. Hệ thống tự tính tổng tiền của lượt khám = tiền thuốc + tiền dịch vụ.
8. Quản trị viên quản lý **người dùng** (`User`) và phân **quyền** (`Role`, `Permission`) — ai được xem gì, ai được sửa gì.

Backend này **không có giao diện**. Nó chỉ nhận yêu cầu từ giao diện web (viết bằng React, nằm ở
project khác) và trả về dữ liệu dạng JSON.

---

## 2. Kiến thức nền tối thiểu

Nếu bạn đã biết những mục dưới đây, hãy nhảy sang phần 3.

### 2.1. Backend / Frontend

```
[ Trình duyệt của người dùng ]        [ Máy chủ ]              [ Cơ sở dữ liệu ]
   Giao diện web (React)      <--->    Backend (dự án này)  <--->   PostgreSQL
        FRONTEND                          BACKEND                      DATABASE
```

- **Frontend**: cái người dùng nhìn thấy và bấm — nút, form, bảng.
- **Backend**: nơi xử lý logic và giữ dữ liệu thật. Frontend **không bao giờ** nói chuyện trực
  tiếp với database, luôn phải đi qua backend. Lý do: bảo mật (không ai được tự ý sửa DB) và
  để đặt luật nghiệp vụ ở một chỗ duy nhất.
- **Database**: nơi lưu dữ liệu vĩnh viễn. Tắt máy chủ đi dữ liệu vẫn còn.

### 2.2. API và HTTP

**API** là "danh sách các việc mà backend cho phép frontend nhờ làm". Mỗi việc là một **endpoint**
gồm 2 phần: **method** (động từ) + **đường dẫn** (danh từ).

| Method | Nghĩa | Ví dụ trong dự án này |
|---|---|---|
| `GET` | Lấy dữ liệu về đọc | `GET /api/v1/customers` — lấy danh sách khách hàng |
| `POST` | Tạo mới | `POST /api/v1/customers` — tạo khách hàng mới |
| `PATCH` | Sửa một phần | `PATCH /api/v1/customers/5` — sửa khách hàng có id = 5 |
| `DELETE` | Xoá | `DELETE /api/v1/visits/5` — huỷ lượt khám id = 5 |

Một request (yêu cầu) gửi lên gồm:

- **URL**: `http://localhost:9999/api/v1/customers?page=1&pageSize=10`
  - `?page=1&pageSize=10` gọi là **query string** — tham số phụ, thường dùng để lọc/phân trang.
- **Headers**: thông tin đi kèm, ví dụ `Authorization: Bearer eyJhbGc...` để chứng minh "tôi đã đăng nhập".
- **Body**: dữ liệu gửi lên (chỉ có ở `POST`/`PATCH`), dạng JSON.

Một response (phản hồi) trả về gồm:

- **Status code**: `200` = OK, `400` = bạn gửi sai, `401` = chưa đăng nhập, `403` = không đủ quyền, `500` = server lỗi.
- **Body**: dữ liệu JSON.

### 2.3. JSON

Là định dạng text để trao đổi dữ liệu. Trông y hệt object trong JavaScript:

```json
{ "name": "Nguyễn Văn An", "parentPhone": "0912345678", "gender": "MALE" }
```

### 2.4. Node.js, npm/yarn, TypeScript

- **Node.js**: bộ máy cho phép chạy JavaScript **ngoài trình duyệt** — tức là chạy trên máy chủ.
- **yarn**: công cụ tải thư viện của người khác về dùng. Danh sách thư viện nằm ở `package.json`,
  code tải về nằm ở thư mục `node_modules/` (thư mục này rất nặng và **không** được commit lên git).
- **TypeScript**: JavaScript + kiểu dữ liệu. Bạn viết `name: string`, nếu lỡ gán số vào thì báo lỗi
  ngay lúc viết code chứ không đợi chạy mới sập. File `.ts` phải được **biên dịch** thành `.js`
  trước khi Node chạy được.

### 2.5. Async / await

Đọc database mất thời gian (vài mili giây). Node.js không đứng chờ, nó đi làm việc khác rồi quay
lại. Cú pháp để "chờ" là `await`, và hàm nào có `await` bên trong thì phải khai báo `async`:

```ts
async function layKhachHang() {
  const kh = await prisma.customer.findUnique({ where: { id: 5 } }); // chờ DB trả lời
  console.log(kh); // dòng này chỉ chạy sau khi có kết quả
}
```

Gặp `await` trong codebase là biết: "chỗ này đang chờ một việc tốn thời gian (DB, mạng...)".

---

## 3. Bức tranh toàn cảnh

Dự án dùng **NestJS** — một *framework* (bộ khung) cho Node.js. Framework nghĩa là: nó đã dựng sẵn
bộ xương, quy định sẵn "code loại này để ở đâu, đặt tên thế nào", bạn chỉ điền phần nghiệp vụ vào.
Nhờ vậy 10 người cùng làm mà code vẫn giống nhau.

Bốn "nhân vật" chính bạn sẽ gặp đi gặp lại:

```
   Request từ frontend
          │
          ▼
   ┌──────────────┐   "Nhận đơn hàng"
   │  CONTROLLER  │   Chỉ lo: URL nào? lấy tham số ra. KHÔNG chứa logic nghiệp vụ.
   └──────┬───────┘   vd: src/modules/customers/customers.controller.ts
          │
          ▼
   ┌──────────────┐   "Nhà bếp"
   │   SERVICE    │   Chứa toàn bộ logic: kiểm tra trùng, tính tiền, gọi DB.
   └──────┬───────┘   vd: src/modules/customers/customers.service.ts
          │
          ▼
   ┌──────────────┐   "Người phiên dịch với database"
   │    PRISMA    │   Viết JS thay vì viết SQL.
   └──────┬───────┘   vd: this.prismaService.customer.findMany(...)
          │
          ▼
     PostgreSQL
```

Cộng thêm:

- **DTO** (*Data Transfer Object*): tờ khai mô tả "dữ liệu gửi lên phải có đúng những trường nào,
  kiểu gì". Sai là chặn ngay từ cửa. vd: `dto/create-customer.dto.ts`.
- **Module**: cái hộp gom Controller + Service + DTO của cùng một chủ đề lại.
  vd: `customers.module.ts` gom mọi thứ liên quan đến khách hàng.

**Quy tắc vàng của kiến trúc này**: Controller *mỏng*, Service *dày*.
Controller chỉ được phép nhận request rồi gọi service. Mọi if/else nghiệp vụ, mọi truy vấn DB
đều nằm trong Service. Bạn sẽ thấy quy tắc này được tuân thủ khắp codebase.

---

## 4. Vòng đời một request — ví dụ cụ thể

Đây là phần **quan trọng nhất** của tài liệu này. Hiểu được phần này là hiểu được 80% codebase.

Giả sử frontend gọi:

```http
GET /api/v1/customers?page=1&pageSize=10&search=An
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Request đi qua **7 trạm** theo đúng thứ tự sau:

```
Request
  │
  ├─(1)─► MIDDLEWARE          src/middlewares/logger.middleware.ts
  │       In ra log "[Middleware] Request..." rồi cho đi tiếp.
  │
  ├─(2)─► GUARD #1: JwtAuthGuard        src/guards/jwt-auth.guard.ts
  │       "Anh là ai?" → Đọc header Authorization, giải mã token.
  │       Sai/thiếu token → dừng, trả 401 Unauthorized.
  │       Đúng → gắn thông tin user vào request (request.user = { id, name }).
  │
  ├─(3)─► GUARD #2: PermissionsGuard    src/guards/permissions.guard.ts
  │       "Anh có được phép làm việc này không?"
  │       Đọc @Permissions(GET_CUSTOMERS) ghi trên hàm, rồi truy vấn DB xem
  │       user này có quyền đó không. Không có → dừng, trả 403 Forbidden.
  │
  ├─(4)─► PIPE: ValidationPipe          bật ở src/main.ts
  │       Lấy ?page=1&pageSize=10&search=An ép vào khuôn FilterCustomerDto.
  │       Chuỗi "1" được đổi thành số 1. Nếu pageSize=999 (vượt max 100) → 400 Bad Request.
  │
  ├─(5)─► CONTROLLER                    customers.controller.ts
  │       findAll(@Query() filter) { return this.customersService.getListCustomers(filter); }
  │       Chỉ có 1 dòng. Đúng tinh thần "controller mỏng".
  │
  ├─(6)─► SERVICE                       customers.service.ts
  │       Chạy song song 2 việc: lấy 10 bản ghi + đếm tổng số bản ghi.
  │       Rồi đóng gói bằng makePaginationResponse(...).
  │       → Trả về { page, pageSize, totalPage, total, data: [...] }
  │
  └─(7)─► INTERCEPTOR                   src/interceptors/response.interceptor.ts
          Bọc kết quả vào một "phong bì" chuẩn trước khi trả cho frontend.
```

> 📌 Đây là bản **rút gọn** cho dễ nhớ. Thực tế Interceptor chạy **hai lần**: một nửa trước khi
> Pipe/Controller chạy, một nửa sau khi có kết quả. Thứ tự đầy đủ và chính xác ở
> [`02-CHI-TIET-THANH-PHAN.md` mục 27](./02-CHI-TIET-THANH-PHAN.md#27-thứ-tự-thực-thi-đầy-đủ).

Kết quả frontend nhận được:

```jsonc
{
  "message": "Success",
  "statusCode": 200,
  "result": {                    // ← đây mới là dữ liệu service trả về
    "page": 1,
    "pageSize": 10,
    "totalPage": 5,
    "total": 47,
    "data": [ { "id": 1, "name": "Nguyễn Văn An", ... } ]
  }
}
```

### Nếu có lỗi thì sao?

Ở bất kỳ trạm nào, nếu code `throw` một lỗi ra, request **nhảy thẳng** tới
`src/filter-exceptions/exception.filter.ts` (gọi là *Exception Filter*), bỏ qua mọi trạm còn lại:

```ts
// trong customers.service.ts
throw new BadRequestException('Name And Parent phone number already exists');
```

Frontend nhận:

```jsonc
{
  "message": "Name And Parent phone number already exists",
  "statusCode": 400,
  "result": null
}
```

👉 **Điểm mấu chốt cần nhớ**: cả khi thành công lẫn khi lỗi, response luôn có đúng 3 trường
`message` / `statusCode` / `result`. Frontend chỉ cần viết code xử lý một khuôn duy nhất.
Bạn **không cần** (và không nên) tự tay tạo phong bì này trong service — cứ `return` dữ liệu thô,
Interceptor sẽ tự bọc.

---

## 5. Bản đồ thư mục

```
nestjs-cobe-base/
├── prisma/                    ← MỌI THỨ VỀ DATABASE
│   ├── schema.prisma          ← ⭐ Định nghĩa các bảng. File quan trọng nhất về dữ liệu.
│   ├── migrations/            ← Lịch sử thay đổi cấu trúc DB (sinh tự động, đừng sửa tay)
│   ├── seed.ts                ← Tạo dữ liệu khởi tạo: tài khoản admin, roles, permissions
│   └── 2_,3_,4_seed_*.ts      ← Tạo dữ liệu giả để test (khách hàng, sản phẩm, lượt khám)
│
├── src/                       ← MỌI CODE CỦA ỨNG DỤNG
│   ├── main.ts                ← ⭐ Điểm khởi động. Bật CORS, ValidationPipe, Swagger, listen port.
│   ├── app.module.ts          ← ⭐ Module gốc, khai báo tất cả module con + interceptor + filter.
│   │
│   ├── modules/               ← ⭐⭐ NGHIỆP VỤ NẰM HẾT Ở ĐÂY
│   │   ├── auth/              ← đăng nhập, refresh token, đăng xuất
│   │   ├── users/             ← nhân viên phòng khám
│   │   ├── roles/             ← vai trò (ADMIN, USER...)
│   │   ├── customers/         ← bệnh nhân
│   │   ├── products/          ← thuốc + nhóm thuốc
│   │   ├── services/          ← dịch vụ + nhóm dịch vụ
│   │   └── visits/            ← lượt khám (phức tạp nhất)
│   │
│   ├── prisma/                ← PrismaService: cầu nối tới DB (LƯU Ý: khác thư mục prisma/ ở gốc!)
│   ├── guards/                ← bảo vệ route: kiểm tra đăng nhập & quyền
│   ├── decorators/            ← @AuthClaims(), @Permissions() tự viết
│   ├── interceptors/          ← bọc response vào phong bì chuẩn
│   ├── filter-exceptions/     ← biến lỗi thành response chuẩn
│   ├── middlewares/           ← chạy trước tất cả, hiện chỉ log
│   ├── dtos/                  ← DTO dùng chung (phân trang, tìm kiếm)
│   ├── constants/             ← hằng số + enum danh sách quyền
│   ├── configs/               ← cấu hình JWT
│   ├── models/                ← vài type dùng chung
│   └── utils/                 ← hàm tiện ích: makePaginationResponse, convertTextToCode
│
├── package.json               ← danh sách thư viện + các lệnh `yarn ...`
├── tsconfig.json              ← cấu hình TypeScript + đường dẫn tắt @n-*
├── docker-compose.yml         ← khai báo 2 container: backend + postgres
├── Makefile                   ← lệnh tắt: make init-dev, make connect...
└── .env                       ← ⚠️ mật khẩu DB, cổng... (KHÔNG commit lên git)
```

⚠️ **Bẫy hay gặp**: có **hai** thư mục tên `prisma`.
- `prisma/` ở gốc = định nghĩa database (schema, migrations, seed).
- `src/prisma/` = code NestJS để gọi database.

Khi thấy `import { PrismaService } from 'prisma/prisma.service'` thì đó là `src/prisma/`, vì
TypeScript được cấu hình lấy `src/` làm gốc (xem `baseUrl` trong `tsconfig.json`).

### Bên trong một module trông như thế nào

Mọi module đều có cùng một bộ file. Học thuộc một cái là hiểu hết:

```
src/modules/customers/
├── customers.module.ts        ← khai báo: module này gồm controller nào, service nào
├── customers.controller.ts    ← định nghĩa URL: POST /customers, GET /customers, ...
├── customers.service.ts       ← logic nghiệp vụ + truy vấn DB
└── dto/
    ├── create-customer.dto.ts ← khuôn dữ liệu khi TẠO mới
    ├── update-customer.dto.ts ← khuôn dữ liệu khi SỬA (= create nhưng mọi trường optional)
    └── filter-customer.dto.ts ← khuôn tham số khi LỌC/phân trang
```

---

## 6. Đi hết một tính năng thật: "Tạo khách hàng mới"

Ta bám theo 4 file, đúng thứ tự dữ liệu chảy qua.

### Bước 1 — DTO: mô tả dữ liệu hợp lệ

`src/modules/customers/dto/create-customer.dto.ts`

```ts
export class CreateCustomerDto {
  @IsString()                              // phải là chuỗi
  @IsNotEmpty()                            // không được rỗng
  @ApiProperty({ example: 'John Doe' })    // để Swagger hiển thị ví dụ
  name: string;

  @IsEnum(Gender)                          // chỉ được là MALE hoặc FEMALE
  @IsOptional()                            // có thể không gửi
  gender?: Gender;

  @IsString()
  @IsNotEmpty()
  parentPhone: string;
  // ...
}
```

Những dòng bắt đầu bằng `@` gọi là **decorator** — hiểu nôm na là "dán nhãn" lên thuộc tính để
thư viện khác đọc được. Ở đây `ValidationPipe` sẽ đọc các nhãn này và tự động kiểm tra dữ liệu.

Nếu frontend gửi thiếu `name`, request bị chặn ngay, service **không hề được gọi**, frontend nhận:

```jsonc
{ "message": "name should not be empty", "statusCode": 400, "result": null }
```

Lợi ích cực lớn: bên trong service bạn được **yên tâm tuyệt đối** rằng `dto.name` luôn là chuỗi
không rỗng — không cần viết `if (!name) ...` nữa.

### Bước 2 — Controller: gắn URL

`src/modules/customers/customers.controller.ts`

```ts
@Controller('customers')            // mọi route trong class này bắt đầu bằng /customers
@ApiTags('Customer')                // gom nhóm trong trang Swagger
@AuthClaims()                       // ⭐ bắt buộc đăng nhập + kiểm tra quyền cho CẢ class
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}  // ⭐ xem giải thích bên dưới

  @Post()                                              // POST /api/v1/customers
  @Permissions(PermissionNameType.CREATE_CUSTOMER)     // cần quyền CREATE_CUSTOMER
  create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customersService.create(createCustomerDto);
  }
}
```

Ba điều cần chú ý:

1. **URL đầy đủ** = `api/v1` (đặt ở `main.ts`) + `customers` (ở `@Controller`) + `''` (ở `@Post`)
   → `POST /api/v1/customers`.
2. **`@Body()`** nghĩa là "lấy phần body của request, ép vào khuôn `CreateCustomerDto`".
   Tương tự có `@Param('id')` lấy `:id` trên URL, `@Query()` lấy `?page=1`, `@Req()` lấy cả request.
3. **`constructor(private readonly customersService: CustomersService)`** — dòng này trông lạ nhưng
   rất quan trọng. Bạn **không** phải tự viết `new CustomersService()`. NestJS nhìn vào kiểu
   `CustomersService` rồi **tự tạo và đưa vào cho bạn**. Cơ chế này gọi là **Dependency Injection**
   (tiêm phụ thuộc) — được giải thích kỹ ở file 02.

### Bước 3 — Service: xử lý nghiệp vụ

`src/modules/customers/customers.service.ts`

```ts
@Injectable()                                   // đánh dấu "class này có thể được DI tiêm đi nơi khác"
export class CustomersService {
  constructor(private prismaService: PrismaService) {}   // tiêm cầu nối DB vào

  async create(createCustomerDto: CreateCustomerDto) {
    // Luật nghiệp vụ 1: không cho trùng (tên + SĐT phụ huynh)
    const existingCustomer = await this.prismaService.customer.findFirst({
      where: {
        parentPhone: createCustomerDto.parentPhone,
        name: createCustomerDto.name,
      },
    });

    if (existingCustomer) {
      throw new BadRequestException('Name And Parent phone number already exists');
    }

    // ... kiểm tra thêm luật 2: trùng (tên + ngày sinh) ...

    // Qua hết kiểm tra → ghi vào DB
    return this.prismaService.customer.create({ data: createCustomerDto });
  }
}
```

Đây là nơi đặt **luật nghiệp vụ** — những thứ mà DTO không kiểm tra được vì cần hỏi database.
DTO chỉ biết "name phải là chuỗi"; chỉ service mới biết "name này đã tồn tại rồi".

### Bước 4 — Module: ráp lại

`src/modules/customers/customers.module.ts`

```ts
@Module({
  imports: [PrismaModule],            // module này cần dùng PrismaService từ PrismaModule
  controllers: [CustomersController], // các controller thuộc module
  providers: [CustomersService],      // các service NestJS được phép tự tạo và tiêm
  exports: [CustomersService],        // cho phép module KHÁC dùng lại service này
})
export class CustomersModule {}
```

Cuối cùng, module phải được khai báo ở `src/app.module.ts` thì NestJS mới biết đến nó:

```ts
@Module({
  imports: [ ..., CustomersModule, VisitsModule, ProductsModule, ServicesModule ],
})
export class AppModule { ... }
```

Quên bước cuối này là lỗi kinh điển của người mới: code viết đủ cả nhưng gọi API luôn trả `404`.

---

## 7. Dữ liệu được tổ chức thế nào

Toàn bộ bảng được định nghĩa trong `prisma/schema.prisma`. Hai cụm quan hệ chính:

### Cụm nghiệp vụ khám bệnh

```
Customer (bệnh nhân)
   │ 1 bệnh nhân có nhiều lượt khám
   ▼
Visit (lượt khám) ──────┬──────────────────────┐
   chẩn đoán, triệu     │                      │
   chứng, tổng tiền     ▼                      ▼
                  Prescription           ServiceUsage
                  (đơn thuốc)            (dịch vụ đã dùng)
                        │                      │
                        ▼                      ▼
                  PrescriptionItem       ServiceUsageItem
                  (từng loại thuốc:      (từng dịch vụ:
                   liều sáng/trưa/         số lượng, giá)
                   chiều/tối, giá)              │
                        │                      │
                        ▼                      ▼
                    Product                 Service
                    (thuốc)                 (dịch vụ)
                        │                      │
                        ▼                      ▼
                 ProductCategory        ServiceCategory
```

Một chi tiết thiết kế đáng chú ý: `PrescriptionItem` **chép lại** `productName` và `price` tại
thời điểm kê đơn, thay vì chỉ trỏ tới `Product`. Vì sao? Vì sang năm giá thuốc tăng, ta vẫn phải
xem được đơn thuốc cũ đã tính đúng bao nhiêu tiền. Đây là kỹ thuật cố ý lặp dữ liệu để **giữ lịch sử**.

### Cụm phân quyền

```
User ──► UsersOnRoles ──► Role ──► RolesOnPermissions ──► Permission
(nhân viên)  (bảng nối)  (vai trò)     (bảng nối)        (quyền lẻ)
```

Đọc từ trái sang: *một nhân viên có nhiều vai trò; một vai trò có nhiều quyền*.
Vì sao cần bảng nối `UsersOnRoles`? Vì đây là quan hệ **nhiều–nhiều**: một user có thể vừa là
`ADMIN` vừa là `DOCTOR`, và vai trò `ADMIN` cũng được gán cho nhiều user. Database không biểu diễn
trực tiếp được nhiều–nhiều, nên phải tách ra bảng trung gian.

### Hai quy ước áp dụng cho MỌI bảng

1. **Không xoá thật.** Mọi bảng có cột `isActive`. "Xoá" = đặt `isActive = false`. Vì vậy khi truy
   vấn bạn phải luôn nhớ lọc `where: { isActive: true }`. Lý do: dữ liệu y tế không được phép mất,
   và xoá thật sẽ làm hỏng các bản ghi đang tham chiếu tới nó.
2. **Tên trong code khác tên trong DB.** Code viết `parentPhone` (camelCase), DB lưu `parent_phone`
   (snake_case). Cầu nối là `@map` trong `schema.prisma`:
   ```prisma
   parentPhone String @map("parent_phone")   // tên TS ↔ tên cột
   @@map("customers")                        // tên class ↔ tên bảng
   ```
   Bạn viết code theo kiểu JS quen thuộc, DB vẫn theo chuẩn SQL. Prisma tự dịch.

---

## 8. Chạy dự án lần đầu

Xem hướng dẫn đầy đủ ở [`../README.md`](../README.md). Bản rút gọn:

```bash
cp .env.example .env
yarn install
make init-dev        # bật container backend + postgres
make connect         # chui vào trong container backend
```

Sau khi vào được shell của container:

```bash
npx prisma migrate deploy   # tạo bảng trong DB
npx prisma db seed          # tạo tài khoản admin + phân quyền
yarn start:dev              # chạy server, tự khởi động lại khi sửa code
```

⚠️ Container **cố ý không tự chạy app** (Dockerfile không có `CMD`). Bạn phải `make connect` rồi
tự gõ `yarn start:dev`. Đây không phải lỗi.

Mở http://localhost:9999/swagger — bạn sẽ thấy trang liệt kê toàn bộ API và **bấm thử được ngay**.
Đây là công cụ tốt nhất để làm quen: đăng nhập bằng `admin` / `123456` ở `POST /auth/login`,
copy `accessToken` nhận được, bấm nút **Authorize** ở góc trên, rồi thử các API khác.

---

## 9. Công thức: thêm một tính năng mới

Ví dụ muốn thêm chức năng quản lý "lịch hẹn" (`appointments`):

1. **Thiết kế bảng** — thêm `model Appointment` vào `prisma/schema.prisma`.
2. **Tạo migration** — `npx prisma migrate dev --name add_appointments`.
   Lệnh này vừa đổi cấu trúc DB thật, vừa sinh lại code Prisma để `prismaService.appointment` có gợi ý.
3. **Sinh khung** — `npx nest g resource modules/appointments` (chọn *REST API*),
   hoặc copy thư mục `customers/` rồi đổi tên cho nhanh.
4. **Viết DTO** — `create-`, `update-`, `filter-`. Nhớ cho `filter-` kế thừa
   `PaginationWithSearchParamsDto` để có sẵn phân trang.
5. **Viết Service** — theo đúng bố cục có sẵn: `create` / `getListX` / `findOne` / `update`,
   rồi tới phần `// Repository methods`.
6. **Viết Controller** — gắn `@AuthClaims()` lên class, `@Permissions(...)` lên từng hàm.
7. **Thêm quyền mới** — phải sửa **cả hai** chỗ: enum trong `prisma/schema.prisma` **và** enum
   trong `src/constants/permissions/permission-name-type.enum.ts`. Rồi migrate + chạy lại
   `npx prisma db seed`.
8. **Khai báo module** trong `src/app.module.ts`.
9. **Kiểm tra kiểu** — chạy `yarn build`. Chế độ `yarn start:dev` **không** kiểm tra kiểu dữ liệu!

---

## 10. Những chỗ dễ vấp

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| Gọi API trả `404` | Quên thêm module vào `app.module.ts`; hoặc quên tiền tố `/api/v1` |
| `401 Unauthorized` | Thiếu header `Authorization: Bearer <token>`, hoặc token hết hạn |
| `403 Forbidden` | Đã đăng nhập nhưng role của bạn chưa có quyền ghi ở `@Permissions(...)` |
| `prismaService.xxx` báo không tồn tại | Sửa `schema.prisma` xong quên chạy `npx prisma generate` |
| Sửa code mà server không đổi | `yarn start:dev` chỉ theo dõi thư mục `src/`; sửa `prisma/` phải khởi động lại tay |
| Chạy được trên Docker, lỗi khi chạy máy thật | `.env.example` khai `DATABASE_HOST` **hai lần**; dòng sau (`postgres`) đè dòng trước. Chạy ngoài Docker phải sửa thành `localhost` + `DATABASE_PORT=5439` |
| Code chạy dev bình thường, `yarn build` lại lỗi | Dev dùng `--transpile-only` (bỏ qua kiểm tra kiểu). Luôn `yarn build` trước khi push |
| Tạo user qua API xong không đăng nhập được | Lỗi đã biết: `POST /users` lưu mật khẩu chưa mã hoá, còn lúc đăng nhập lại so bằng bcrypt |
| `GET /customers` trả về `parent_phone`, còn `GET /customers/:id` trả `parentPhone` | `CustomersService.findAll` dùng SQL thô nên giữ nguyên tên cột snake_case của DB |
| Danh sách lượt khám không thấy dữ liệu cũ | `VisitsService.findAll` ghi cứng khoảng thời gian "hôm nay" |
| `GET /users` trả về cả cột `password` | Service `return` thẳng object Prisma, dự án chưa có DTO cho dữ liệu đi ra |

---

## 11. Từ điển thuật ngữ

| Thuật ngữ | Giải thích ngắn gọn |
|---|---|
| **Framework** | Bộ khung dựng sẵn, quy định code để ở đâu. NestJS là framework. |
| **Module** | Cái hộp gom code cùng chủ đề (controller + service + dto). |
| **Controller** | Nhận request, ánh xạ URL → hàm. Không chứa logic. |
| **Service** | Chứa logic nghiệp vụ và truy vấn DB. |
| **Provider** | Bất cứ class nào NestJS có thể tự tạo & tiêm đi nơi khác (service là loại phổ biến nhất). |
| **DI** (Dependency Injection) | NestJS tự tạo object và đưa vào constructor cho bạn. |
| **Decorator** | Dòng bắt đầu bằng `@`, dán "nhãn" lên class/hàm/thuộc tính để thư viện khác đọc. |
| **DTO** | Class mô tả hình dạng dữ liệu vào/ra + luật kiểm tra. |
| **Guard** | Người gác cửa: quyết định request được đi tiếp hay bị chặn. |
| **Interceptor** | Bọc quanh request: can thiệp trước và/hoặc sau khi controller chạy. |
| **Pipe** | Biến đổi & kiểm tra dữ liệu đầu vào trước khi controller nhận. |
| **Middleware** | Chạy sớm nhất, trước cả Guard. |
| **Exception Filter** | Bắt mọi lỗi `throw` ra và biến thành response chuẩn. |
| **ORM** | Công cụ giúp thao tác DB bằng code thay vì viết SQL. Prisma là ORM. |
| **Migration** | Một file ghi lại thay đổi cấu trúc DB, để mọi máy đều có DB giống nhau. |
| **Seed** | Script nhồi dữ liệu ban đầu vào DB (tài khoản admin, danh mục quyền...). |
| **JWT** | Chuỗi token mã hoá chứng minh danh tính, gửi kèm mỗi request. |
| **Endpoint** | Một cặp (method + đường dẫn), vd `GET /customers`. |
| **Payload** | Phần dữ liệu bên trong (của body hoặc của token). |
| **Swagger** | Trang web tự sinh, liệt kê API và cho bấm thử. |

---

## 12. Lộ trình đọc code gợi ý

Đọc theo đúng thứ tự này, đừng nhảy cóc:

1. `prisma/schema.prisma` — hiểu dữ liệu trước, mọi thứ khác đều xoay quanh nó.
2. `src/main.ts` — xem app khởi động ra sao (ngắn, ~50 dòng).
3. `src/app.module.ts` — xem app gồm những module nào.
4. **Module `customers`** (đủ 4 file) — đây là module đơn giản và điển hình nhất. Đọc kỹ.
5. `src/interceptors/response.interceptor.ts` + `src/filter-exceptions/exception.filter.ts` —
   hiểu vì sao response luôn có 3 trường.
6. `src/guards/` + `src/decorators/claims-auth.decorator.ts` — hiểu cơ chế đăng nhập & phân quyền.
7. **Module `visits`** — phức tạp nhất, có transaction. Để dành cuối cùng.

Sau đó đọc [`02-CHI-TIET-THANH-PHAN.md`](./02-CHI-TIET-THANH-PHAN.md) để hiểu sâu từng khái niệm.
