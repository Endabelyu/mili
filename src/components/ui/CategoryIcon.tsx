import { useState } from 'react';
import { colors } from '../../styles/design-tokens';

interface CategoryIconProps {
  category: string;
  icon?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
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
  
  // Charity & Giving
  if (name.includes('charity') || name.includes('sedekah') || name.includes('amal') || name.includes('zakat') || name.includes('donasi')) return colors.category.charity;
  
  // Housing & Living
  if (name.includes('house') || name.includes('home') || name.includes('rumah') || name.includes('kos') || name.includes('rent')) return colors.category.housing;
  
  // Pets
  if (name.includes('pet') || name.includes('hewan') || name.includes('kucing') || name.includes('anjing')) return colors.category.family;
  
  // Gadgets & Tech
  if (name.includes('gadget') || name.includes('hp') || name.includes('laptop') || name.includes('tech')) return colors.category.shopping;
  
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

// Map generic names to specific 3D icon files
export const getCategory3DIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  
  // Accounts & Core Finance
  if (name.includes('bank') || name.includes('rekening')) return 'category_bank';
  if (name.includes('credit') || name.includes('kartu') || name.includes('cc')) return 'category_credit_card';
  if (name.includes('cash') || name.includes('tunai') || name.includes('wallet')) return 'category_cash';
  if (name.includes('crypto') || name.includes('koin') || name.includes('coin')) return 'category_crypto';
  
  // Daily & Lifestyle
  if (name.includes('makan') || name.includes('minum') || name.includes('kopi') || name.includes('food')) return 'category_food';
  if (name.includes('belanja') || name.includes('shop')) return 'category_shopping';
  if (name.includes('cloth') || name.includes('pakaian') || name.includes('baju') || name.includes('celana')) return 'category_clothing';
  if (name.includes('transport') || name.includes('car') || name.includes('bensin') || name.includes('parkir') || name.includes('otomotif')) return 'category_transport';
  
  // Health & Education
  if (name.includes('sehat') || name.includes('med') || name.includes('health')) return 'category_health';
  if (name.includes('gym') || name.includes('fitness') || name.includes('olahraga')) return 'category_gym';
  if (name.includes('edu') || name.includes('sekolah') || name.includes('belajar') || name.includes('book')) return 'category_education';
  
  // Bills & Utilities
  if (name.includes('bill') || name.includes('util') || name.includes('tagihan') || name.includes('listrik') || name.includes('internet')) return 'category_bills';
  if (name.includes('gas') || name.includes('lpg')) return 'category_gas';
  if (name.includes('water') || name.includes('air')) return 'category_water';
  
  // Income & Profit
  if (name.includes('salary') || name.includes('gaji') || name.includes('profit')) return 'category_salary';
  if (name.includes('gift') || name.includes('hadiah') || name.includes('kado') || name.includes('bonus')) return 'category_gift';
  if (name.includes('freelance') || name.includes('side')) return 'category_freelance';
  
  // Savings & Goals
  if (name.includes('invest') || name.includes('saham')) return 'category_investment';
  if (name.includes('goal') || name.includes('tabungan') || name.includes('savings')) return 'category_savings';
  if (name.includes('retire') || name.includes('pensiun') || name.includes('tua')) return 'category_retirement';
  if (name.includes('tax') || name.includes('pajak')) return 'category_tax';
  
  // Family & Misc
  if (name.includes('fam') || name.includes('keluarga') || name.includes('anak') || name.includes('bayi')) return 'category_family';
  if (name.includes('wedding') || name.includes('nikah')) return 'category_wedding';
  if (name.includes('charity') || name.includes('sedekah') || name.includes('amal') || name.includes('zakat') || name.includes('donasi')) return 'category_charity';
  if (name.includes('house') || name.includes('home') || name.includes('rumah') || name.includes('kos') || name.includes('rent')) return 'category_housing';
  if (name.includes('pet') || name.includes('hewan') || name.includes('kucing') || name.includes('anjing')) return 'category_pet';
  if (name.includes('gadget') || name.includes('hp') || name.includes('laptop') || name.includes('tech')) return 'category_gadget';
  if (name.includes('emergen') || name.includes('darurat') || name.includes('sos')) return 'category_emergency';
  
  // Entertainment & Travel
  if (name.includes('fun') || name.includes('hiburan') || name.includes('hobby')) return 'category_entertainment';
  if (name.includes('hobby') || name.includes('hobi') || name.includes('game') || name.includes('musik')) return 'category_hobby';
  if (name.includes('travel') || name.includes('liburan') || name.includes('jalan')) return 'category_travel';
  if (name.includes('debt') || name.includes('hutang') || name.includes('cicilan') || name.includes('loan')) return 'category_debt';

  return 'category_general'; // generic 3D icon fallback
};

export function CategoryIcon({ category, icon, size = 'md', className = '' }: CategoryIconProps) {
  const [imgError, setImgError] = useState(false);
  const styles = getCategoryStyles(category);
  const threeDIcon = icon?.startsWith('category_') ? icon : getCategory3DIcon(category);
  
  const sizeClasses = {
    xs: 'w-8 h-8 text-[14px] rounded-[10px]',
    sm: 'w-9 h-9 text-[16px] rounded-[12px]',
    md: 'w-10 h-10 text-[18px] rounded-[14px]',
    lg: 'w-12 h-12 text-[22px] rounded-[16px]',
    xl: 'w-14 h-14 text-[26px] rounded-[18px]',
  };

  return (
    <div
      className={`flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className} overflow-hidden`}
      style={{ backgroundColor: styles.bg, color: styles.text }}
      title={category}
    >
      {!imgError ? (
        <img 
          src={`/categories/${threeDIcon}.png`} 
          alt={category} 
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-[1.2em]">✨</span> // ultimate fallback if image fails
      )}
    </div>
  );
}
