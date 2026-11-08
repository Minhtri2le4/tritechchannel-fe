// Chặn thông tin gõ bậy khi đặt hàng (VD địa chỉ "ádasdas", tên "hacker").
// Cách làm: tiếng Việt mỗi tiếng đều theo khuôn "phụ âm đầu + vần + phụ âm cuối" – chữ gõ bừa trên bàn phím
// gần như không bao giờ khớp khuôn này. File này giống hệt backend_tritech/src/utils/sanity.js – sửa thì sửa cả hai.

const strip = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

// Một tiếng tiếng Việt (đã bỏ dấu): nguyen, huynh, phuong, ngach, khu, quan, duong...
const SYLLABLE = /^(ngh|ng|gh|gi|kh|nh|ph|th|tr|ch|qu|[bcdghklmnpqrstvx])?(uye|uya|uyu|ieu|yeu|uoi|uou|oai|oay|oeo|uay|uau|[aeiouy]{1,2})(ch|nh|ng|c|m|n|p|t)?$/;
export const isVietSyllable = (word) => SYLLABLE.test(strip(word));

const words = (s) => s.split(/[\s,./\\\-–()]+/).filter(Boolean);
const BLOCK = ['hacker', 'hack', 'asd', 'asdf', 'asdasd', 'qwe', 'qwer', 'qwerty', 'zxc', 'fake', 'dmm', 'dcm', 'vcl', 'clgt', 'admin', 'bot'];
const blocked = (s) => words(strip(s)).some((w) => BLOCK.includes(w));

// Họ tên: không chứa từ bị chặn, ít nhất nửa số chữ là tiếng Việt hợp lệ (vẫn cho tên nước ngoài ngắn như "John Nguyễn")
export const nameLooksReal = (name) => {
  const ws = words(name);
  if (!ws.length || blocked(name)) return false;
  const ok = ws.filter(isVietSyllable).length;
  return ok >= 1 && ok * 2 >= ws.length;
};

// Số nhà, tên đường: có ít nhất 2 tiếng tiếng Việt, hoặc có số nhà + 1 tiếng ("12 Nguyễn Xí", "hẻm 5", "Thôn Đông")
export const streetLooksReal = (street) => {
  const ws = words(street);
  if (blocked(street)) return false;
  const hasDigit = /\d/.test(street);
  const ok = ws.filter((w) => /\p{L}/u.test(w) && isVietSyllable(w)).length;
  return ok >= 2 || (hasDigit && ok >= 1);
};

// Số điện thoại gõ cho có: dãy số liên tiếp (0923456789, 0987654321), một số lặp lại (0911111111),
// hoặc chỉ 1-2 chữ số khác nhau (0909090909). Đúng đầu số nhưng không ai dùng số kiểu này.
export const phoneLooksReal = (phone) => {
  const d = String(phone).replace(/\D/g, '').replace(/^84/, '0').slice(1);
  if (d.length < 9) return false;
  let up = 1;
  let down = 1;
  let same = 1;
  for (let i = 1; i < d.length; i++) {
    const diff = d.charCodeAt(i) - d.charCodeAt(i - 1);
    up = diff === 1 ? up + 1 : 1;
    down = diff === -1 ? down + 1 : 1;
    same = diff === 0 ? same + 1 : 1;
    if (up >= 7 || down >= 7 || same >= 6) return false;
  }
  return new Set(d).size > 2;
};
