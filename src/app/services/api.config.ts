function getProductionUrl(): string {
	try {
		const raw = localStorage.getItem('url_produccion') || '';
		return raw.trim().replace(/\/+$/, '');
	} catch {
		return '';
	}
}

export const URL_PRODUCCION = getProductionUrl();

export const API_BASE_URL_users = URL_PRODUCCION || 'http://localhost:3001';
export const API_BASE_URL_tickets = URL_PRODUCCION || 'http://localhost:3002';
export const API_BASE_URL_groups = URL_PRODUCCION || 'http://localhost:3003';