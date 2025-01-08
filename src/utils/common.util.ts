import { COMMON_CONSTANT } from 'constants';

export function makePaginationResponse(
  data: any,
  page: number,
  pageSize: number,
  total: number,
) {
  if (pageSize) {
    const limit = pageSize || COMMON_CONSTANT.DEFAULT_PAGE_SIZE;

    return {
      page: page || COMMON_CONSTANT.DEFAULT_PAGE,
      pageSize: limit,
      totalPage: Math.ceil(total / limit),
      total,
      data,
    };
  }
  return {
    page: COMMON_CONSTANT.DEFAULT_PAGE,
    pageSize: 0,
    totalPage: 1,
    total,
    data,
  };
}

export function convertTextToCode(text) {
  return text
    .normalize('NFD') // Chuyển đổi ký tự tiếng Việt thành ký tự cơ bản
    .replace(/[\u0300-\u036f]/g, '') // Loại bỏ dấu
    .replace(/\s+/g, '') // Loại bỏ khoảng trắng
    .replace(/[^a-zA-Z0-9]/g, ''); // Loại bỏ các ký tự không phải chữ cái, chữ số
}
