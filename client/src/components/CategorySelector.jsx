import React from 'react';
import { AVAILABLE_CATEGORIES } from '../constants/categories';

const CategorySelector = ({
  selected = [],
  onChange,
  categories = AVAILABLE_CATEGORIES,
}) => {
  const toggleCategory = (category) => {
    if (selected.includes(category)) {
      onChange(selected.filter((item) => item !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <div className="category-pills-grid">
      {categories.map((category) => {
        const isSelected = selected.includes(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => toggleCategory(category)}
            className={`category-pill ${isSelected ? 'selected' : ''}`}
          >
            {isSelected ? '✓ ' : '+ '}
            {category}
          </button>
        );
      })}
    </div>
  );
};

export default CategorySelector;
