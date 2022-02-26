import { render, screen, fireEvent } from '@testing-library/react';
import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';

import { mocked } from 'jest-mock';

import { SubscribeButton } from './index';

jest.mock('next-auth/client');
jest.mock('next/router');

describe('SubscribeButton component', () => {
	it('renders correctly', () => {
		const useSessionMocked = mocked(useSession);

		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<SubscribeButton priceId="" />);

		expect(screen.getByText('Subscribe now')).toBeInTheDocument();
	});

	it('redirects user to sign in when not authenticated', () => {
		const useSessionMocked = mocked(useSession);
		const signInMocked = mocked(signIn);

		useSessionMocked.mockReturnValueOnce([null, false]);

		render(<SubscribeButton priceId="" />);

		const subscribeButton = screen.getByText('Subscribe now');

		fireEvent.click(subscribeButton);

		expect(signInMocked).toHaveBeenCalled();
	});

	it('redirects to posts when user already has a subscription', () => {
		const useRouterMocked = mocked(useRouter);
		const useSessionMocked = mocked(useSession);
		const pushMock = jest.fn();

		useSessionMocked.mockReturnValueOnce([
			{
				user: { name: 'John Doe', email: 'johndoe@example.com' },
				expires: 'fake-expires',
				activeSubscription: 'fake-activeSubscription',
			},
			false,
		]);

		useRouterMocked.mockReturnValueOnce({
			push: pushMock,
		} as any);

		render(<SubscribeButton priceId="" />);

		const subscribeButton = screen.getByText('Subscribe now');

		fireEvent.click(subscribeButton);

		expect(pushMock).toHaveBeenCalledWith('/posts');
	});
});
