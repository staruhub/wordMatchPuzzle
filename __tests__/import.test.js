/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ImportPage from '../app/import/page';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock toast component
jest.mock('@/components/ui/use-toast', () => ({
  toast: jest.fn(),
}));

describe('ImportPage', () => {
  let mockRouter;
  let mockPush;

  beforeEach(() => {
    mockPush = jest.fn();
    mockRouter = {
      push: mockPush,
    };
    useRouter.mockReturnValue(mockRouter);
    
    // Clear localStorage before each test
    localStorageMock.clear();
  });

  it('renders the import page correctly', () => {
    render(<ImportPage />);
    
    expect(screen.getByText('导入自定义单词')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/apple,苹果/)).toBeInTheDocument();
    expect(screen.getByText('导入单词')).toBeInTheDocument();
    expect(screen.getByText('返回首页')).toBeInTheDocument();
  });

  it('shows error when input is empty', async () => {
    const { toast } = require('@/components/ui/use-toast');
    render(<ImportPage />);
    
    // Click import button with empty input
    fireEvent.click(screen.getByText('导入单词'));
    
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: '输入为空',
      variant: 'destructive',
    }));
  });

  it('shows error when input has less than 3 word pairs', async () => {
    const { toast } = require('@/components/ui/use-toast');
    render(<ImportPage />);
    
    // Set input with only 2 word pairs
    fireEvent.change(screen.getByPlaceholderText(/apple,苹果/), {
      target: { value: 'apple,苹果\nbook,书' },
    });
    
    // Click import button
    fireEvent.click(screen.getByText('导入单词'));
    
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: '单词太少',
      variant: 'destructive',
    }));
  });

  it('shows error when input format is incorrect', async () => {
    const { toast } = require('@/components/ui/use-toast');
    render(<ImportPage />);
    
    // Set input with incorrect format
    fireEvent.change(screen.getByPlaceholderText(/apple,苹果/), {
      target: { value: 'apple,苹果\nbook\ncat,猫' },
    });
    
    // Click import button
    fireEvent.click(screen.getByText('导入单词'));
    
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: '导入失败',
      variant: 'destructive',
    }));
  });

  it('successfully imports valid word pairs and redirects to game', async () => {
    const { toast } = require('@/components/ui/use-toast');
    render(<ImportPage />);
    
    // Set valid input with 3 word pairs
    const testInput = 'apple,苹果\nbook,书\ncat,猫';
    fireEvent.change(screen.getByPlaceholderText(/apple,苹果/), {
      target: { value: testInput },
    });
    
    // Click import button
    fireEvent.click(screen.getByText('导入单词'));
    
    // Check if localStorage was updated correctly
    const expectedWordPairs = [
      { word: 'apple', translation: '苹果' },
      { word: 'book', translation: '书' },
      { word: 'cat', translation: '猫' },
    ];
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'customWordList',
      JSON.stringify(expectedWordPairs)
    );
    
    // Check if success toast was shown
    expect(toast).toHaveBeenCalledWith(expect.objectContaining({
      title: '导入成功',
      description: '已导入 3 对单词',
    }));
    
    // Check if redirected to game page with custom mode
    expect(mockPush).toHaveBeenCalledWith('/game?mode=custom');
  });

  it('handles tab-separated input correctly', async () => {
    render(<ImportPage />);
    
    // Set valid input with tab separator
    const testInput = 'apple\t苹果\nbook\t书\ncat\t猫';
    fireEvent.change(screen.getByPlaceholderText(/apple,苹果/), {
      target: { value: testInput },
    });
    
    // Click import button
    fireEvent.click(screen.getByText('导入单词'));
    
    // Check if localStorage was updated correctly
    const expectedWordPairs = [
      { word: 'apple', translation: '苹果' },
      { word: 'book', translation: '书' },
      { word: 'cat', translation: '猫' },
    ];
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'customWordList',
      JSON.stringify(expectedWordPairs)
    );
    
    // Check if redirected to game page with custom mode
    expect(mockPush).toHaveBeenCalledWith('/game?mode=custom');
  });
});
