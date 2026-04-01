import { colors } from '../../styles/design-tokens';

interface CategoryIconProps {
  category: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Map generic names to semantic keys in our design tokens
export const getCategoryStyles = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('food') || name.includes('makan') || name.includes('minum') || name.includes('dine')) return colors.category.food;
  if (name.includes('shop') || name.includes('belanja')) return colors.category.shopping;
  if (name.includes('transport') || name.includes('car') || name.includes('gas')) return colors.category.transport;
  if (name.includes('health') || name.includes('sehat')) return colors.category.health;
  if (name.includes('edu') || name.includes('sekolah') || name.includes('belajar')) return colors.category.education;
  if (name.includes('bill') || name.includes('util') || name.includes('tagihan')) return colors.category.bills;
  if (name.includes('fun') || name.includes('hiburan') || name.includes('entertain')) return colors.category.entertainment;
  if (name.includes('salary') || name.includes('gaji')) return colors.category.salary;
  if (name.includes('freelance') || name.includes('lepas')) return colors.category.freelance;
  if (name.includes('invest') || name.includes('saham')) return colors.category.investment;
  
  return colors.category.default;
};

// Map generic names to fun emojis per the FlowState design
export const getCategoryEmoji = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('food') || name.includes('makan')) return '🍔';
  if (name.includes('coffee') || name.includes('kopi')) return '☕';
  if (name.includes('shop') || name.includes('belanja')) return '🛍️';
  if (name.includes('transport') || name.includes('car')) return '🚗';
  if (name.includes('health') || name.includes('medik')) return '🏥';
  if (name.includes('edu') || name.includes('sekolah')) return '📚';
  if (name.includes('bill') || name.includes('tagihan')) return '🧾';
  if (name.includes('fun') || name.includes('hiburan')) return '🎉';
  if (name.includes('gift') || name.includes('kado')) return '🎁';
  if (name.includes('salary') || name.includes('gaji')) return '💵';
  if (name.includes('freelance') || name.includes('kerja')) return '💻';
  if (name.includes('invest') || name.includes('saham')) return '📈';
  if (name.includes('rent') || name.includes('sewa')) return '🏠';
  
  return '✨'; // default fun emoji
};

export function CategoryIcon({ category, size = 'md', className = '' }: CategoryIconProps) {
  const styles = getCategoryStyles(category);
  const emoji = getCategoryEmoji(category);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[14px] rounded-[10px]',
    md: 'w-[44px] h-[44px] text-[20px] rounded-[14px]',
    lg: 'w-14 h-14 text-[26px] rounded-[18px]',
  };

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: styles.bg, color: styles.text }}
      title={category}
    >
      <span>{emoji}</span>
    </div>
  );
}
