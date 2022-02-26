import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/client';
import { mocked } from 'jest-mock';

import { getPrismicClient } from '../../services/prismic';

jest.mock('../../services/prismic');
jest.mock('next-auth/client');

import Posts, { getStaticProps } from '../../pages/posts';

const posts = [
	{
		slug: 'my-new-post',
		title: 'My new post',
		excerpt: 'Post example',
		updatedAt: '04 de Fevereiro',
	},
];

describe('Posts page', () => {
	it('renders correctly', () => {
		const useSessionMocked = mocked(useSession);

		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<Posts posts={posts} />);

		expect(screen.getByText('My new post')).toBeInTheDocument();
		expect(screen.getByText('Post example')).toBeInTheDocument();
	});

	it('loads initial data', async () => {
		const useSessionMocked = mocked(useSession);
		const getPrimisClientMocked = mocked(getPrismicClient);

		useSessionMocked.mockReturnValueOnce([null, false]);

		getPrimisClientMocked.mockReturnValueOnce({
			query: jest.fn().mockResolvedValueOnce({
				results: [
					{
						uid: 'my-new-post',
						data: {
							title: [{ type: 'heading', text: 'My new post' }],
							content: [{ type: 'paragraph', text: 'Post example' }],
						},
						last_publication_date: '02-04-2022',
					},
				],
			}),
		} as any);

		const response = await getStaticProps({});

		expect(response).toEqual(
			expect.objectContaining({
				props: {
					posts: [
						{
							slug: 'my-new-post',
							title: 'My new post',
							excerpt: 'Post example',
							updatedAt: '04 de fevereiro de 2022',
						},
					],
				},
			})
		);
	});
});
