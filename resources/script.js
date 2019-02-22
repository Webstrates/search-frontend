webstrate.on('loaded', () => {
	/**
	 * Convert a query string into an object.
	 * @param  {string} queryString String, e.g. "foo=bar&baz=cow"
	 * @return {object}             Object representation of string, e.g. { foo: bar, baz: cow }.
	 * @private
	 */
	const queryStringToObject = (queryString) => {
		return queryString.split('&').reduce((object, item) => {
			const [key, val] = item.split('=');
			if (key && val) {
				object[key] = decodeURIComponent(val);
			}
			return object;
		}, {});
	};

	const objectToQueryString = (object) => {
		return Object.keys(object).map(key =>  `${key}=${encodeURIComponent(object[key])}`).join('&');
	};

	const addToHash = (key, value, addToLocation = true) => {
		const object = queryStringToObject(location.hash.substring(1));
		if (key && value) {
			object[key] = value;
		} else {
			delete object[key];
		}
		const hash = objectToQueryString(object);
		if (addToLocation) {
			location.hash = hash;
		}
		return hash;
	};

	const getFromHash = (key) => {
		const object = queryStringToObject(location.hash.substring(1));
		return object[key];
	};

	/**
	 * Create a table from results and return it.
	 * @param  {Array} results  List of results.
	 * @return {HTMLTable}      Table with results.
	 */
	const createResultBox = (results) => {
		const box = document.createElement('div');
		box.setAttribute('id', 'results');

		const table = document.createElement('table');

		let hits = '';

		results.hits.hits.forEach((hit) => {
			const title = (hit.highlight && hit.highlight.title && hit.highlight.title
				.join(" &hellip; ")) || hit._source.title || hit._id;
			const doc = hit.highlight.doc && hit.highlight.doc.join(" &hellip; ")
				|| '<em>(empty)</em>';
			const permissions = hit._source.permissions && hit._source.permissions.join(', ');
			const ctime = hit._source.ctime && new Date(hit._source.ctime);
			const mtime = hit._source.mtime && new Date(hit._source.mtime);

			hits += `
				<div class="hit">
					<h3><a href="/${hit._id}/">${title}</a></h3>
					<div>
						<span class="score">${hit._score.toFixed(2)}</span>
						<span class="webstrateId"><a href="/${hit._id}/">/${hit._id}</a></span>`;
			if (ctime && mtime) {
				hits += `
						<span class="dates">
							(created <abbr title="${ctime}">${timeSince(ctime)}</abbr> ago,
							edited <abbr title="${mtime}">${timeSince(mtime)}</abbr> ago)
						</span>`;
			}
			hits += `
					</div>
					<span class="highlights">${doc}</span>
					<span class="permissions">${permissions}</span>
			</div>`;
		});

		box.insertAdjacentHTML('beforeend', hits);

		box.insertAdjacentHTML('beforeend', `
			<div id="metadata">Query took <strong>${results.took}ms</strong>
			and found <strong>${results.hits.total} matches</strong>.</div>`);

		// Create page links
		let total = results.hits.total;
		let limit = Number(getFromHash('l')) || 10;
		if (limit > 0 && total > limit) {
			let pages = Math.ceil(total / limit);
			let pagesHtml = [];
			const p = Number(getFromHash('p')) || 1;
			const first = Math.max(1, p - 10);
			if (p > 1) {
				pagesHtml.push(`<a href="#${addToHash('p', p - 1, false)}" chevron>&lsaquo;</a>`);
				if (p > limit + 1) {
					pagesHtml.push(`<a href="#${addToHash('p', 1, false)}">&hellip;</a>`);
				}
			}
			const last = Math.min(pages, p + 10);
			for (let i=first, l=last; i <= l; ++i) {
				const hash = addToHash('p', i, false);
				pagesHtml.push(`<a href="#${hash}" ${i === p ? 'current' : ''}>${i}</a>`);
			}
			if (p < pages) {
				if (p + limit < pages) {
					pagesHtml.push(`<a href="#${addToHash('p', pages, false)}">&hellip;</a>`);
				}
				pagesHtml.push(`<a href="#${addToHash('p', p + 1, false)}" chevron>&rsaquo;</a>`);
			}
			box.insertAdjacentHTML('beforeend', `<div id="pages">
				${pagesHtml.join(' ')}
			</div>`);
		}

		return box;
	};

	/**
	 * Perform search, create result box and insert it into the DOM.
	 */
	const search = async () => {
		const oldResults = container.querySelector('div#results');
		if (oldResults) oldResults.remove();

		// No query, no search.
		if (!location.hash.substring(1)) return;

		const searchAddr = location.hostname === 'localhost' ? '//localhost:7010/' : '/_search';
		const response = await fetch(`${searchAddr}?${location.hash.substring(1)}`);
		const results = await response.json();

		const box = createResultBox(results);

		container.appendChild(box);
	};

	/**
	 * Constructor
	 */
	const searchButton = document.querySelector('button#searchButton');
	const searchField = document.querySelector('input#searchField');

	const container = document.createElement('transient');
	document.querySelector('div#container').appendChild(container);

	if (webstrate.user.userId === 'anonymous:') {
		container.insertAdjacentHTML('beforeend',
		`<div id="userBox">
			For better search results,<br> log in below:<br>
			<a href="/auth/au"><img src="au-logo.png" title="Aarhus University Login" /></a>
			<a href="/auth/github"><img src="github-logo.png" title="GitHub Login" /></a>
		</div>`);
	} else {
		container.insertAdjacentHTML('beforeend',
		`<div id="userBox">
			You are logged in as<br>
			<strong>${webstrate.user.userId}</strong>.<br>
			(<a href="/auth/logout">Log out</a>).
		</div>`);
	}

	searchButton.addEventListener('click', () => addToHash('q', searchField.value, true));
	searchField.addEventListener('keydown', (event) => {
		if (event.key === 'Enter') addToHash('q', searchField.value, true);
	});

	document.querySelectorAll('div#dateSelectors input').forEach(input => {
		input.value = getFromHash(input.id);
		input.addEventListener('change', e => addToHash(input.id, input.value));
	});

	window.addEventListener('hashchange', (e) => search());

	// Search for whatever is in hash on load.
	search();

	searchField.value = getFromHash('q') || '';

	searchField.focus();
});