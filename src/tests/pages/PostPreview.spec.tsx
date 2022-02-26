import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { mocked } from 'jest-mock';

import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');
jest.mock('next/router');

import PostPreview, { getStaticProps } from '../../pages/posts/preview/[slug]';

const post = {
	slug: 'my-new-post',
	title: 'My new post',
	content: '<p>Post excerpt</p>',
	updatedAt: '04 de Fevereiro',
};

describe('Post preview page', () => {
	it('renders correctly', () => {
		const useSessionMocked = mocked(useSession);

		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<PostPreview post={post} />);

		expect(screen.getByText('My new post')).toBeInTheDocument();
		expect(screen.getByText('Post excerpt')).toBeInTheDocument();
		expect(screen.getByText('Wanna continue reading?')).toBeInTheDocument();
	});

	it('redirects user to full post when user is subscribed', async () => {
		const useSessionMocked = mocked(useSession);
		const useRouterMocked = mocked(useRouter);
		const pushMock = jest.fn();

		useRouterMocked.mockReturnValueOnce({
			push: pushMock,
		} as any);

		useSessionMocked.mockReturnValueOnce([
			{
				activeSubscription: 'fake-activeSubscription',
			},
			false,
		]);

		render(<PostPreview post={post} />);

		expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post');
	});

	it('loads initial data', async () => {
		const getPrismicMocked = mocked(getPrismicClient);

		getPrismicMocked.mockReturnValueOnce({
			getByUID: jest.fn().mockResolvedValueOnce({
				data: {
					title: [{ type: 'heading', text: 'My new post' }],
					content: [{ type: 'paragraph', text: 'Post content' }],
				},
				last_publication_date: '02-04-2022',
			}),
		} as any);

		const response = await getStaticProps({
			params: {
				slug: 'my-new-post',
			},
		} as any);

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					post: {
						slug: 'my-new-post',
						title: 'My new post',
						content: '<p>Post content</p>',
						updatedAt: '04 de fevereiro de 2022',
					},
				},
			})
		);
	});
});
