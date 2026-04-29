import { useState } from 'react';
import { colors } from '../../styles/design-tokens';

interface CategoryIconProps {
  category: string;
  icon?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Map generic names to semantic keys in our design tokens
export const getCategoryStyles = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  // Health & Wellness
  if (name.includes('health') || name.includes('sehat') || name.includes('med') || name.includes('gym')) return colors.category.health;
  
  // Education & Growth
  if (name.includes('edu') || name.includes('sekolah') || name.includes('belajar') || name.includes('book')) return colors.category.education;
  
  // Bills & Utilities
  if (name.includes('bill') || name.includes('util') || name.includes('tagihan') || name.includes('listrik') || name.includes('internet')) return colors.category.bills;
  
  // Food & Dining
  if (name.includes('food') || name.includes('makan') || name.includes('minum') || name.includes('kopi')) return colors.category.food;
  
  // Transport & Auto
  if (name.includes('transport') || name.includes('car') || name.includes('bensin') || name.includes('parkir') || name.includes('otomotif')) return colors.category.transport;
  
  // Shopping & Lifestyle
  if (name.includes('shop') || name.includes('belanja') || name.includes('pakaian')) return colors.category.shopping;
  
  // Entertainment & Fun
  if (name.includes('fun') || name.includes('hiburan') || name.includes('hobby') || name.includes('travel')) return colors.category.entertainment;
  
  // Income & Profit
  if (name.includes('salary') || name.includes('gaji') || name.includes('bonus') || name.includes('profit')) return colors.category.salary;
  
  // Freelance & Side Hustle
  if (name.includes('freelance') || name.includes('lepas') || name.includes('side')) return colors.category.freelance;
  
  // Investment & Savings
  if (name.includes('invest') || name.includes('saham') || name.includes('goal') || name.includes('target') || name.includes('pensiun')) return colors.category.investment;
  
  // Family & Kids
  if (name.includes('fam') || name.includes('keluarga') || name.includes('anak') || name.includes('bayi')) return colors.category.family;
  
  // Debt & Credit
  if (name.includes('debt') || name.includes('hutang') || name.includes('cicilan') || name.includes('loan')) return colors.category.debt;

  // Accounts
  if (name.includes('acc-') || name.includes('bank') || name.includes('rekening') || name.includes('wallet')) return colors.category.shopping; 
  
  return colors.category.default;
};

// Map generic names to fun emojis per the FlowState design
export const getCategoryEmoji = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('makan')) return '🍽️';
  if (name.includes('kopi')) return '☕';
  if (name.includes('belanja')) return '🛒';
  if (name.includes('transport')) return '🛵';
  if (name.includes('sehat')) return '🩺';
  if (name.includes('sekolah')) return '🎒';
  if (name.includes('tagihan')) return '📄';
  if (name.includes('hiburan')) return '🎬';
  if (name.includes('gaji')) return '💼';
  if (name.includes('invest')) return '💹';
  if (name.includes('rumah')) return '🏠';
  if (name.includes('mobil')) return '🚗';
  if (name.includes('anak') || name.includes('bayi')) return '👶';
  if (name.includes('hutang')) return '⛓️';
  
  return '✨'; // default fun emoji
};

export function CategoryIcon({ category, icon, size = 'md', className = '' }: CategoryIconProps) {
  const [imgError, setImgError] = useState(false);
  const styles = getCategoryStyles(category);
  const emoji = getCategoryEmoji(category);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[14px] rounded-[10px]',
    md: 'w-[44px] h-[44px] text-[20px] rounded-[14px]',
    lg: 'w-14 h-14 text-[26px] rounded-[18px]',
  };

  const isCustomIcon = icon && icon.startsWith('category_') && !imgError;

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className} overflow-hidden`}
      style={{ backgroundColor: styles.bg, color: styles.text }}
      title={category}
    >
      {isCustomIcon ? (
        <img 
          src={`/categories/${icon}.png`} 
          alt={category} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{icon || emoji}</span>
      )}
    </div>
  );
}
