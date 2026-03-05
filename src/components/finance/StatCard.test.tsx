import { describe, it, expect } from 'vitest';
import { render, screen } from '@/lib/test-utils';
import { DollarSign, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders title and value', () => {
    render(
      <StatCard
        title="Total Balance"
        value="$5,000"
        icon={DollarSign}
      />
    );
    
    expect(screen.getByText('Total Balance')).toBeInTheDocument();
    expect(screen.getByText('$5,000')).toBeInTheDocument();
  });

  it('renders with default variant', () => {
    const { container } = render(
      <StatCard title="Default" value="100" icon={DollarSign} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-gray-50');
    expect(card).toHaveClass('border-gray-100');
  });

  it('renders with primary variant', () => {
    const { container } = render(
      <StatCard title="Primary" value="100" icon={DollarSign} variant="primary" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-blue-50');
    expect(card).toHaveClass('border-blue-100');
  });

  it('renders with income variant', () => {
    const { container } = render(
      <StatCard title="Income" value="100" icon={DollarSign} variant="income" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-green-50');
    expect(card).toHaveClass('border-green-100');
  });

  it('renders with expense variant', () => {
    const { container } = render(
      <StatCard title="Expense" value="100" icon={DollarSign} variant="expense" />
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-red-50');
    expect(card).toHaveClass('border-red-100');
  });

  it('renders positive change with TrendingUp icon', () => {
    render(
      <StatCard
        title="Revenue"
        value="$10,000"
        icon={DollarSign}
        change={15.5}
        changeLabel="vs last month"
      />
    );
    
    expect(screen.getByText('+15.5%')).toBeInTheDocument();
    expect(screen.getByText('vs last month')).toBeInTheDocument();
    
    // Check for green styling on positive change
    const changeText = screen.getByText('+15.5%');
    expect(changeText).toHaveClass('text-green-600');
  });

  it('renders negative change with TrendingDown icon', () => {
    render(
      <StatCard
        title="Expenses"
        value="$5,000"
        icon={DollarSign}
        change={-8.3}
        changeLabel="vs last month"
      />
    );
    
    expect(screen.getByText('-8.3%')).toBeInTheDocument();
    
    // Check for red styling on negative change
    const changeText = screen.getByText('-8.3%');
    expect(changeText).toHaveClass('text-red-600');
  });

  it('renders zero change with Minus icon', () => {
    render(
      <StatCard
        title="Stable"
        value="$1,000"
        icon={DollarSign}
        change={0}
      />
    );
    
    expect(screen.getByText('0.0%')).toBeInTheDocument();
    
    // Check for gray styling on zero change
    const changeText = screen.getByText('0.0%');
    expect(changeText).toHaveClass('text-gray-500');
  });

  it('does not render change section when change is undefined', () => {
    const { container } = render(
      <StatCard title="No Change" value="100" icon={DollarSign} />
    );
    
    // Should not have any percentage text
    expect(container.querySelector('.text-green-600')).not.toBeInTheDocument();
    expect(container.querySelector('.text-red-600')).not.toBeInTheDocument();
  });

  it('renders loading skeleton when isLoading is true', () => {
    const { container } = render(
      <StatCard title="Loading" value="0" icon={DollarSign} isLoading />
    );
    
    // Check for animate-pulse class on loading state
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('animate-pulse');
    
    // Should show skeleton elements instead of content
    expect(screen.queryByText('Loading')).not.toBeInTheDocument();
  });

  it('renders icon correctly', () => {
    const { container } = render(
      <StatCard title="With Icon" value="100" icon={DollarSign} />
    );
    
    // Check for icon container
    const iconContainer = container.querySelector('[class*="rounded-lg"] [class*="w-5 h-5"]');
    expect(iconContainer).toBeInTheDocument();
  });

  it('truncates long titles and values', () => {
    render(
      <StatCard
        title="Very Long Title That Should Be Truncated"
        value="999999999.99"
        icon={DollarSign}
      />
    );
    
    const title = screen.getByText('Very Long Title That Should Be Truncated');
    const value = screen.getByText('999999999.99');
    
    expect(title).toHaveClass('truncate');
    expect(value).toHaveClass('truncate');
  });
});
