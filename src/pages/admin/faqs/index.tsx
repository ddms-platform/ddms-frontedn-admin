import { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';
import Pagination from '@/components/shared/pagination';

const ACCENT = '#FF385C';
const CARD = {
  backgroundColor: '#0d1629',
  border: '1px solid rgba(255,255,255,0.06)',
} as const;

const FAQS = [
  {
    id: 1,
    question: 'Làm thế nào để đặt tour trên DDMS?',
    answer:
      'Bạn có thể đặt tour bằng cách tìm kiếm tour phù hợp, chọn ngày khởi hành và số lượng khách, sau đó tiến hành thanh toán qua các phương thức được hỗ trợ.',
    category: 'Đặt tour',
    order: 1,
  },
  {
    id: 2,
    question: 'Chính sách hủy tour như thế nào?',
    answer:
      'Hủy trước 7 ngày: hoàn 100%. Hủy từ 3-7 ngày: hoàn 70%. Hủy dưới 3 ngày: hoàn 30%. Hủy trong ngày khởi hành: không hoàn tiền.',
    category: 'Thanh toán',
    order: 2,
  },
  {
    id: 3,
    question: 'Tôi có thể thanh toán bằng những phương thức nào?',
    answer:
      'DDMS hỗ trợ thanh toán qua: Thẻ tín dụng/ghi nợ (Visa, Mastercard), Chuyển khoản ngân hàng, Ví điện tử (MoMo, ZaloPay, VNPay).',
    category: 'Thanh toán',
    order: 3,
  },
  {
    id: 4,
    question: 'Làm sao để trở thành chủ thuyền trên DDMS?',
    answer:
      'Đăng ký tài khoản, sau đó vào mục "Trở thành chủ thuyền", điền thông tin và upload giấy phép kinh doanh. Đội ngũ admin sẽ xét duyệt trong vòng 2-5 ngày làm việc.',
    category: 'Chủ thuyền',
    order: 4,
  },
  {
    id: 5,
    question: 'Tôi có thể đặt tour cho bao nhiêu người?',
    answer:
      'Số lượng khách tối đa phụ thuộc vào sức chứa của từng thuyền/tour. Mỗi tour sẽ hiển thị số chỗ còn lại.',
    category: 'Đặt tour',
    order: 5,
  },
];

const CATEGORIES = ['Tất cả', 'Đặt tour', 'Thanh toán', 'Chủ thuyền'];

export default function AdminFaqs() {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('Tất cả');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const filtered =
    filterCat === 'Tất cả'
      ? FAQS
      : FAQS.filter((f) => f.category === filterCat);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedFaqs = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  return (
    <div className="px-4 py-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: '#fff', letterSpacing: '-0.44px' }}
          >
            Câu hỏi thường gặp
          </h1>
          <p className="mt-1 text-sm" style={{ color: '#8892a0' }}>
            Quản lý bộ FAQ hiển thị cho người dùng trên nền tảng
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ backgroundColor: ACCENT, color: '#fff' }}
        >
          <Plus size={16} /> Thêm câu hỏi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Tổng câu hỏi', value: FAQS.length },
          {
            label: 'Danh mục',
            value: new Set(FAQS.map((f) => f.category)).size,
          },
          { label: 'Câu hỏi hot nhất', value: 'Đặt tour' },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-4 flex items-center gap-3"
            style={CARD}
          >
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0"
              style={{ backgroundColor: 'rgba(255,56,92,0.1)' }}
            >
              <HelpCircle size={16} style={{ color: ACCENT }} />
            </div>
            <div>
              <p className="text-lg font-bold" style={{ color: '#fff' }}>
                {s.value}
              </p>
              <p className="text-xs" style={{ color: '#8892a0' }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-2xl p-6 space-y-4" style={CARD}>
          <h2 className="text-base font-semibold" style={{ color: '#fff' }}>
            Thêm câu hỏi mới
          </h2>
          <div className="space-y-3">
            {[
              {
                label: 'Câu hỏi',
                placeholder: 'Nhập câu hỏi...',
                isTextarea: false,
              },
              {
                label: 'Câu trả lời',
                placeholder: 'Nhập câu trả lời chi tiết...',
                isTextarea: true,
              },
              {
                label: 'Danh mục',
                placeholder: 'VD: Đặt tour',
                isTextarea: false,
              },
            ].map(({ label, placeholder, isTextarea }) => (
              <div key={label}>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#8892a0' }}
                >
                  {label}
                </label>
                {isTextarea ? (
                  <textarea
                    rows={3}
                    placeholder={placeholder}
                    className="w-full rounded-xl py-2.5 px-4 text-sm outline-none resize-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                    }}
                  />
                ) : (
                  <input
                    placeholder={placeholder}
                    className="w-full rounded-xl py-2.5 px-4 text-sm outline-none"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:opacity-90"
              style={{ backgroundColor: ACCENT, color: '#fff' }}
            >
              Lưu
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold hover:bg-white/5"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: '#c8d0e0',
              }}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setFilterCat(cat);
              setCurrentPage(1);
            }}
            className="rounded-xl px-4 py-2 text-xs font-semibold transition-all"
            style={
              filterCat === cat
                ? { backgroundColor: ACCENT, color: '#fff' }
                : {
                    backgroundColor: '#0d1629',
                    color: '#8892a0',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FAQ accordion */}
      <div className="space-y-3">
        {paginatedFaqs.map((faq) => (
          <div
            key={faq.id}
            className="rounded-2xl overflow-hidden transition-all hover:scale-[1.005]"
            style={CARD}
          >
            <button
              className="w-full flex items-center justify-between px-6 py-4 text-left"
              onClick={() => setExpanded(expanded === faq.id ? null : faq.id)}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold shrink-0"
                  style={{
                    backgroundColor: 'rgba(255,56,92,0.1)',
                    color: ACCENT,
                  }}
                >
                  {faq.order}
                </span>
                <div className="text-left">
                  <p
                    className="text-sm font-semibold"
                    style={{ color: '#fff' }}
                  >
                    {faq.question}
                  </p>
                  <span
                    className="text-[10px] font-medium"
                    style={{ color: ACCENT }}
                  >
                    {faq.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-4">
                <button
                  className="rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                  style={{ color: '#8892a0' }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  className="rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                  style={{ color: '#EF4444' }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <Trash2 size={14} />
                </button>
                {expanded === faq.id ? (
                  <ChevronUp size={16} style={{ color: '#8892a0' }} />
                ) : (
                  <ChevronDown size={16} style={{ color: '#8892a0' }} />
                )}
              </div>
            </button>
            {expanded === faq.id && (
              <div
                className="px-6 pb-5 border-t"
                style={{ borderColor: 'rgba(255,255,255,0.04)' }}
              >
                <p
                  className="mt-4 text-sm leading-relaxed"
                  style={{ color: '#c8d0e0' }}
                >
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <p className="text-center py-12 text-sm" style={{ color: '#8892a0' }}>
            Không tìm thấy câu hỏi nào
          </p>
        )}

        {/* Pagination Bar */}
        {filtered.length > 0 && (
          <div
            className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl"
            style={CARD}
          >
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: '#8892a0' }}
            >
              <span>
                Hiển thị{' '}
                <strong style={{ color: '#fff' }}>
                  {(currentPage - 1) * pageSize + 1} -{' '}
                  {Math.min(currentPage * pageSize, filtered.length)}
                </strong>{' '}
                trên tổng số{' '}
                <strong style={{ color: '#fff' }}>{filtered.length}</strong> câu
                hỏi
              </span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-lg px-2.5 py-1.5 text-xs outline-none cursor-pointer"
                style={{
                  backgroundColor: '#141e35',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                }}
              >
                <option value={5}>5 / trang</option>
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
              </select>
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
