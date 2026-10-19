
const API_BASE_URL = 'http://127.0.0.1:8000';

// ---------- BUSES ----------

export type ApiBus = {
  id: number;
  operator_name: string;
  source: string;
  destination: string;
  departure_time: string;
  arrival_time: string;
  total_seats: number;
  fare: number;
};

export async function getBuses(): Promise<ApiBus[]> {
  const response = await fetch(`${API_BASE_URL}/buses`);

  if (!response.ok) {
    throw new Error('Unable to load buses from the server.');
  }

  const data = await response.json();
  return data.buses;
}

// ---------- AUTHENTICATION HELPERS ----------

function getAuthHeaders() {
  const token = localStorage.getItem('tripzo-access-token');

  if (!token) {
    throw new Error('Please log in again to continue.');
  }

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ---------- BOOKINGS ----------

export type CreateBookingRequest = {
  bus_id: number;
  seats_booked: number;
};

export async function createBooking(
  booking: CreateBookingRequest
) {
  const response = await fetch(`${API_BASE_URL}/bookings`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(booking),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Booking failed.');
  }

  return data;
}

export async function cancelBookingApi(bookingId: number) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${bookingId}/cancel`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Cancellation failed.');
  }

  return data;
}

export async function getUserBookings(userId: number) {
  const response = await fetch(
    `${API_BASE_URL}/bookings/${userId}`,
    {
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to load bookings.');
  }

  return data;
}

// ---------- REGISTRATION ----------

export type RegisterUserRequest = {
  full_name: string;
  email: string;
  phone: string;
  password: string;
};

export async function registerUser(user: RegisterUserRequest) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'User registration failed.');
  }

  return data;
}

// ---------- LOGIN ----------

export type LoginRequest = {
  email: string;
  password: string;
};

export async function loginUser(credentials: LoginRequest) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Login failed.');
  }

  return data;
}

// ---------- USER PROFILE ----------

export type ApiUser = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
};

export async function getMyProfile(): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to load your profile.');
  }

  return data.user;
}

export async function updateMyProfile(
  updates: Partial<Pick<ApiUser, 'full_name' | 'email' | 'phone'>>
): Promise<ApiUser> {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to update your profile.');
  }

  return data.user;
}

// ---------- SAVED PASSENGERS ----------

export type ApiSavedPassenger = {
  id: number;
  name: string;
  age: number;
  gender: string;
};

export type CreateSavedPassengerRequest = {
  name: string;
  age: number;
  gender: string;
};

export async function getSavedPassengers(): Promise<ApiSavedPassenger[]> {
  const response = await fetch(`${API_BASE_URL}/saved-passengers`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to load saved passengers.');
  }

  return data.passengers;
}

export async function addSavedPassenger(
  passenger: CreateSavedPassengerRequest
): Promise<ApiSavedPassenger> {
  const response = await fetch(`${API_BASE_URL}/saved-passengers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(passenger),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to save passenger.');
  }

  return data.passenger;
}

export async function deleteSavedPassenger(
  passengerId: number
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/saved-passengers/${passengerId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || 'Unable to delete passenger.');
  }
}
