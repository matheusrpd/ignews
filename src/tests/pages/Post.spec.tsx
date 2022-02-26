import { render, screen } from '@testing-library/react';
import { getSession } from 'next-auth/client';
import { mocked } from 'jest-mock';

import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

import Post, { getServerSideProps } from '../../pages/posts/[slug]';

const post = {
	slug: 'my-new-post',
	title: 'My new post',
	content: '<p>Post example</p>',
	updatedAt: '04 de Fevereiro',
};

describe('Post page', () => {
	it('renders correctly', () => {
		render(<Post post={post} />);

		expect(screen.getByText('My new post')).toBeInTheDocument();
		expect(screen.getByText('Post example')).toBeInTheDocument();
	});

	it('redirects user if no subscription is found', async () => {
		const getSessionMocked = mocked(getSession);

		getSessionMocked.mockReturnValueOnce({
			activeSubscription: null,
		} as any);

		const response = await getServerSideProps({
			params: {
				slug: 'my-new-post',
			},
		} as any);

		expect(response).toEqual(
			expect.objectContaining({
				redirect: expect.objectContaining({
					destination: '/',
				}),
			})
		);
	});

	it('loads initial data', async () => {
		const getSessionMocked = mocked(getSession);
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

		getSessionMocked.mockReturnValueOnce({
			activeSubscription: 'fake-activeSubscription',
		} as any);

		const response = await getServerSideProps({
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
