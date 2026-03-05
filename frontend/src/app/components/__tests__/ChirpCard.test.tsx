import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { ChirpCard } from '../ChirpCard';
import type { ChirpDisplay } from '../ChirpCard';

function renderChirpCard(props: React.ComponentProps<typeof ChirpCard>) {
  return render(
    <MemoryRouter>
      <ChirpCard {...props} />
    </MemoryRouter>
  );
}

const mockChirp: ChirpDisplay = {
  id: '1',
  author_id: 1,
  author: {
    id: 1,
    username: 'testuser',
    profile_picture_url: null,
    level: 1,
  },
  content: 'Hello world chirp',
  created_at: new Date().toISOString(),
  likes_count: 5,
  retweets_count: 2,
  comments_count: 3,
  is_liked: false,
  is_retweeted: false,
};

describe('ChirpCard', () => {
  it('renders author and content', () => {
    const onLike = jest.fn();
    const onRetweet = jest.fn();
    const onComment = jest.fn();
    renderChirpCard({ chirp: mockChirp, onLike, onRetweet, onComment });
    expect(screen.getByText(/@testuser/)).toBeInTheDocument();
    expect(screen.getByText('Hello world chirp')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('calls onLike when like button is clicked', async () => {
    const onLike = jest.fn();
    renderChirpCard({ chirp: mockChirp, onLike, onRetweet: jest.fn(), onComment: jest.fn() });
    const likeButton = screen.getByText('5').closest('button');
    if (likeButton) await userEvent.click(likeButton);
    expect(onLike).toHaveBeenCalledWith('1');
  });

  it('calls onComment when comment button is clicked', async () => {
    const onComment = jest.fn();
    renderChirpCard({ chirp: mockChirp, onLike: jest.fn(), onRetweet: jest.fn(), onComment });
    const commentButton = screen.getByText('3').closest('button');
    if (commentButton) await userEvent.click(commentButton);
    expect(onComment).toHaveBeenCalledWith('1');
  });

  it('renders retweet label when original_tweet is present', () => {
    const retweetChirp: ChirpDisplay = {
      ...mockChirp,
      id: '2',
      author: { ...mockChirp.author, username: 'retweeter' },
      original_tweet: mockChirp,
    };
    renderChirpCard({ chirp: retweetChirp, onLike: jest.fn(), onRetweet: jest.fn(), onComment: jest.fn() });
    expect(screen.getByText(/@retweeter rechirped/)).toBeInTheDocument();
    expect(screen.getByText('Hello world chirp')).toBeInTheDocument();
  });
});
