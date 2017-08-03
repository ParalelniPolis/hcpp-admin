// @flow
import Head from 'next/head';

import type { Element, Children } from 'react';

type Props = {
	children: Children
}

export default (props: Props): Element<any> => (
	<main>
		<Head>
			<meta charSet="utf-8" />
			<title>HCPP Administration</title>
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.11/semantic.min.css" />
		</Head>
		{props.children}
	</main>
);
