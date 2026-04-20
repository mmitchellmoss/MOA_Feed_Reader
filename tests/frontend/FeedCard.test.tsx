import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeedCard } from '../../src/components/FeedCard';
import { FeedItem } from '../../src/types';

describe('FeedCard', () => {
  const mockItem: FeedItem = {
    title: 'Test Post',
    creator: 'Test Author',
    pubDate: '2026-04-20T12:00:00.000Z',
    link: 'https://example.com/post',
    guid: '123'
  };

  it('renders correctly', () => {
    render(
      <FeedCard 
        item={mockItem}
        isSubscribed={false}
        isExpanded={false}
        viewMode="summary"
        onToggleSubscribe={vi.fn()}
        onToggleIgnore={vi.fn()}
        onToggleExpand={vi.fn()}
      />
    );
    expect(screen.getByText('Test Post')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('calls onToggleSubscribe when subscribe button is clicked', () => {
    const onToggleSubscribe = vi.fn();
    render(
      <FeedCard 
        item={mockItem}
        isSubscribed={false}
        isExpanded={false}
        viewMode="summary"
        onToggleSubscribe={onToggleSubscribe}
        onToggleIgnore={vi.fn()}
        onToggleExpand={vi.fn()}
      />
    );
    fireEvent.click(screen.getByTestId('subscribe-btn-123'));
    expect(onToggleSubscribe).toHaveBeenCalled();
  });
});
