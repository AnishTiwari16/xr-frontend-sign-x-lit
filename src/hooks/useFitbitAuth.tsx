import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export const fetchUserData = async (token: string) => {
    try {
        const res = await fetch(
            'https://api.fitbit.com/1/user/-/profile.json',
            {
                method: 'GET',
                headers: { Authorization: `Bearer ${token}` },
            }
        );

        if (!res.ok) {
            throw new Error('Failed to fetch Fitbit data');
        }

        const data = await res.json();

        return data?.user;
    } catch (err) {
        console.error('Error fetching user data:', err);
        throw err;
    }
};
export const fetchStats = async (token: string) => {
    try {
        const urls = [
            'https://api.fitbit.com/1/user/-/br/date/today.json',
            'https://api.fitbit.com/1/user/-/activities/heart/date/today/1d.json',
            'https://api.fitbit.com//1/user/-/cardioscore/date/today.json',
        ];

        const responses = await Promise.all(
            urls.map((url) =>
                fetch(url, {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                })
            )
        );

        responses.forEach((res) => {
            if (!res.ok)
                throw new Error(`Failed to fetch data from ${res.url}`);
        });

        const [brData, caloriesData, vo2Max] = await Promise.all(
            responses.map((res) => res.json())
        );

        return {
            brData,
            caloriesData,
            vo2Max,
        };
    } catch (err) {
        console.error('Error fetching Fitbit data:', err);
        throw err;
    }
};

export function useFitbitAuth() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const exchangeToken = async (code: string) => {
        try {
            const codeVerifier = sessionStorage.getItem('code_verifier');
            const response = await fetch(
                'https://api.fitbit.com/oauth2/token',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },

                    body: new URLSearchParams({
                        client_id: '23PW5Y',
                        grant_type: 'authorization_code',
                        code: code,
                        code_verifier: codeVerifier || '',
                    }),
                }
            );

            return await response.json();
        } catch (err) {
            console.error('Error exchanging token:', err);
        }
    };

    useEffect(() => {
        const queryCode = searchParams.get('code');
        if (queryCode) {
            exchangeToken(queryCode)
                .then(async (elem) => {
                    await fetchUserData(elem.access_token);
                    sessionStorage.setItem('fitbit_token', elem.access_token);
                    const newUrl =
                        window.location.origin + window.location.pathname;
                    router.replace(newUrl);
                })
                .catch((error) =>
                    console.error('Token exchange failed:', error)
                );
        }
    }, [searchParams]);
}
