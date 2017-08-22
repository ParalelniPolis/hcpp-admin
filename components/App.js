// @flow
import * as React from 'react';
import Head from 'next/head';

import type { Element } from 'react';

type Props = {
	children: React.Node
}

const App = (props: Props): Element<any> => (
	<main>
		<Head>
			<meta charSet="utf-8" />
			<title>HCPP Administration</title>
			<meta name="robots" content="noindex,nofollow" />
			<meta name="viewport" content="width=device-width, initial-scale=1" />
			<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.2.11/semantic.min.css" />
		</Head>
		{props.children}
	</main>
);

export default App;
