export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    userId: string;
    username: string;
    isAdmin: boolean;
  };
}

export interface User {
  userId: string;
  username: string;
  email?: string;
  isAdmin: boolean;
}

export interface Expediente {
  iue: string;
  caratula: string;
  origen: string;
  estado: string;
  movementCount: number;
  decretoCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  expedienteId: string;
  sk: string;
  fecha: string;
  tipo: string;
  sede: string;
  vencimiento?: string;
  decretoNumber?: string;
  decretoText?: string;
  isReserved?: boolean;
  createdAt: string;
}

export interface NotificationPreferences {
  movementTypes: string[];
  channels: ('email' | 'sms')[];
  enabled: boolean;
}

export interface TrackExpedienteRequest {
  iue: string;
  notificationPreferences: NotificationPreferences;
}

export interface TrackExpedienteResponse {
  expediente: Expediente;
  movementCount: number;
  decretoCount: number;
  message: string;
}

export interface ExpedienteTracking {
  expediente: Expediente;
  unreadCount: number;
  hasNewDecretos: boolean;
  lastViewedAt: string;
  subscriptionDate: string;
}

export interface ExpedientesListResponse {
  expedientes: ExpedienteTracking[];
  totalCount: number;
}

export interface ExpedienteDetailResponse {
  expediente: Expediente;
  movements: Movement[];
  unreadCount: number;
  hasNewDecretos: boolean;
  userLastViewed?: string; // Made optional since backend doesn't always include it
}

export interface RecentDecreto {
  expedienteId: string;
  expedienteCaratula: string;
  decretoId: string;
  decretoDate: string;
  decretoText: string | { attributes?: any; $value: string };
  isRead: boolean;
  movementSk: string;
}

export interface DashboardSummaryResponse {
  totalExpedientes: number;
  expedientesWithNewMovements: number;
  expedientesWithUnreadDecretos: number;
  lastRefreshTimestamp: string | null;
  recentDecretos: RecentDecreto[];
}