function getProductionUrl(): string {
	try {
		const raw = localStorage.getItem('url_produccion') || '';
		return raw.trim().replace(/\/+$/, '');
	} catch {
		return '';
	}
}

export const URL_PRODUCCION = 'http://3.22.185.75';

export const API_BASE_URL_users = '/api';
export const API_BASE_URL_tickets = '/api';
export const API_BASE_URL_groups = '/api';