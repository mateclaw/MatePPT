
export enum AppView {
  CREATE_VIDEO = 'CREATE_VIDEO',
  CREATE_AVATAR = 'CREATE_AVATAR',
  REALTIME_INTERACTION = 'REALTIME_INTERACTION',
  VIDEO_MANAGEMENT = 'VIDEO_MANAGEMENT',
  AVATAR_MANAGEMENT = 'AVATAR_MANAGEMENT'
}

export interface Avatar {
  id: string;
  name: string;
  image: string;
  description: string;
  createdAt: string;
}

export interface SynthesizedVideo {
  id: string;
  title: string;
  avatarName: string;
  voiceName: string;
  thumbnail: string;
  createdAt: string;
  content: string;
}

export enum VideoTaskStatus {
  INIT = 0,
  PENDING = 1,
  PROCESSING = 2,
  SUCCESS = 3,
  FAILED = 4,
  CANCELED = 5
}

export const TaskStatusConfig: Record<VideoTaskStatus, { label: string; color: string }> = {
  [VideoTaskStatus.INIT]: { label: '初始状态', color: 'bg-gray-500' },
  [VideoTaskStatus.PENDING]: { label: '排队中', color: 'bg-blue-500' },
  [VideoTaskStatus.PROCESSING]: { label: '系统处理中', color: 'bg-yellow-500' },
  [VideoTaskStatus.SUCCESS]: { label: '已完成', color: 'bg-green-500' },
  [VideoTaskStatus.FAILED]: { label: '失败', color: 'bg-red-500' },
  [VideoTaskStatus.CANCELED]: { label: '已取消', color: 'bg-gray-500' },
};

export enum VideoTaskRenderMode {
  NORMAL = 0,
  PPT = 1
}
