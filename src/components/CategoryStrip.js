import { Button } from 'react-bootstrap';

const categoryDetails = {
  'Tất cả': { icon: '✦', description: 'Khám phá mọi đầu sách' },
  'Văn học': { icon: '⌁', description: 'Những câu chuyện chạm cảm xúc' },
  'Kinh tế': { icon: '↗', description: 'Tư duy tài chính & kinh doanh' },
  'Kỹ năng sống': { icon: '◈', description: 'Phát triển mỗi ngày' },
  'Thiếu nhi': { icon: '☼', description: 'Nuôi dưỡng trí tưởng tượng' },
  'Sách mới': { icon: '✺', description: 'Các tựa sách vừa về' },
};

function CategoryStrip({ categories, selectedCategory, onSelectCategory }) {
  return (
    <section className="category-section" id="categories" aria-label="Danh mục sách">
      <div className="category-heading">
        <div>
          <p className="eyebrow">Tìm theo chủ đề</p>
          <h2>Danh mục dành cho bạn</h2>
        </div>
        <span>Chọn một danh mục để lọc sách</span>
      </div>

      <div className="category-strip">
        {categories.map((category) => {
          const details = categoryDetails[category] || { icon: '•', description: 'Khám phá sách hay' };
          const isSelected = category === selectedCategory;

          return (
            <Button
              aria-pressed={isSelected}
              className={isSelected ? 'active-category' : ''}
              variant="light"
              type="button"
              key={category}
              onClick={() => onSelectCategory(category)}
            >
              <span className="category-icon" aria-hidden="true">{details.icon}</span>
              <span className="category-copy">
                <strong>{category}</strong>
                <small>{details.description}</small>
              </span>
              <span className="category-arrow" aria-hidden="true">→</span>
            </Button>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryStrip;
