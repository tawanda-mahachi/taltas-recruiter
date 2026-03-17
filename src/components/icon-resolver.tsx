// @ts-nocheck
import {
  IconBot, IconDna, IconTarget, IconChart, IconBrain, IconRocket,
  IconSeedling, IconFlashlight, IconBriefcase, IconSettings, IconLeaf,
  IconBull, IconWaves, IconClipboard, IconCalendar, IconSlack,
  IconDiamond, IconGlobe, IconSearch, IconCloud, IconButterfly,
  IconPin, IconPointFinger, IconStar, IconMessageCircle,
  IconPipeline, IconCandidates, IconReports, IconMap, IconUser,
  IconDownload, IconExport, IconBarChart, IconPieChart, IconMoney,
  IconActivity, IconClock, IconHandshake, IconFileText, IconTrendingUp,
  IconCpu,
} from '@/components/icons';

const ICON_MAP: Record<string, (p: { size?: number; className?: string; color?: string }) => JSX.Element> = {
  bot: IconBot,
  dna: IconDna,
  target: IconTarget,
  chart: IconChart,
  brain: IconBrain,
  rocket: IconRocket,
  seedling: IconSeedling,
  flashlight: IconFlashlight,
  briefcase: IconBriefcase,
  settings: IconSettings,
  leaf: IconLeaf,
  bull: IconBull,
  waves: IconWaves,
  clipboard: IconClipboard,
  calendar: IconCalendar,
  slack: IconSlack,
  diamond: IconDiamond,
  globe: IconGlobe,
  search: IconSearch,
  cloud: IconCloud,
  butterfly: IconButterfly,
  pin: IconPin,
  finger: IconPointFinger,
  star: IconStar,
  message: IconMessageCircle,
  pipeline: IconPipeline,
  candidates: IconCandidates,
  reports: IconReports,
  map: IconMap,
  user: IconUser,
  download: IconDownload,
  export: IconExport,
  'bar-chart': IconBarChart,
  'pie-chart': IconPieChart,
  money: IconMoney,
  activity: IconActivity,
  clock: IconClock,
  handshake: IconHandshake,
  'file-text': IconFileText,
  'trending-up': IconTrendingUp,
  cpu: IconCpu,
};

export function resolveIcon(key: string, props?: { size?: number; className?: string; color?: string }) {
  const Icon = ICON_MAP[key];
  if (!Icon) return null;
  return <Icon {...(props || {})} />;
}

