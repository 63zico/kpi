const storageKey = "doya-kpi-levelup-v2";
const langStorageKey = "levelove-employee-lang";
const draftStorageKey = "levelove-employee-quest-drafts-v1";
const levelSeenStorageKey = "levelove-employee-level-seen-v1";
const teamReviewTarget = 30;
const cloudReadTimeoutMs = 6000;
const cloudCriticalSaveTimeoutMs = 12000;
const allWorkDays = [0, 1, 2, 3, 4, 5, 6];
const levelXpThresholds = [
  0, 50, 160, 300, 460, 660, 870, 1100, 1360, 1630,
  1920, 2230, 2550, 2880, 3230, 3600, 3980, 4370, 4770, 5190,
  5620, 6060, 6520, 6980, 7460, 7940, 8440, 8950, 9470, 10000,
];
const specialCleanAreas = [
  { id: "fridge-gasket", xp: 10, ko: "냉장고 손잡이/문틈/고무패킹", vi: "Tay nắm/khe cửa/gioăng tủ lạnh" },
  { id: "fridge-inside", xp: 10, ko: "냉장고 안 청소", vi: "Vệ sinh bên trong tủ lạnh" },
  { id: "freezer-defrost", xp: 10, ko: "냉동고 성에 제거", vi: "Xả đá tủ đông" },
  { id: "sink-drain", xp: 10, ko: "싱크대 하부/배수구 주변", vi: "Dưới bồn rửa/khu vực thoát nước" },
  { id: "glass-cleaning", xp: 10, ko: "유리청소", vi: "Lau kính" },
  { id: "hood-grease", xp: 10, ko: "후드기름때 청소", vi: "Vệ sinh dầu mỡ máy hút mùi" },
  { id: "prep-table-legs", xp: 10, ko: "조리대 밑/다리 주변", vi: "Dưới bàn sơ chế/chân bàn" },
  { id: "storage-shelves", xp: 10, ko: "재료 보관 선반", vi: "Kệ bảo quản nguyên liệu" },
  { id: "gas-room", xp: 10, ko: "가스실 청소", vi: "Vệ sinh khu vực gas" },
];
const defaultPerformanceItems = {
  hall: [
    { id: "reviewPoint", xp: 10, max: 1, ko: "리뷰 미션", vi: "Nhiệm vụ review" },
    { id: "upsellPoint", xp: 10, max: 1, ko: "업셀 미션", vi: "Nhiệm vụ upsell" },
    { id: "membershipPoint", xp: 10, max: 1, ko: "멤버십 미션", vi: "Nhiệm vụ membership" },
    { id: "recommendedMenuPoint", xp: 10, max: 1, ko: "추천메뉴 미션", vi: "Nhiệm vụ món đề xuất" },
  ],
  kitchen: specialCleanAreas.map((area) => ({
    id: `clean-${area.id}`,
    areaId: area.id,
    xp: area.xp,
    ko: area.ko,
    vi: area.vi,
    max: 1,
  })),
  marketer: [
    { id: "threadPostPoint", xp: 10, ko: "쓰레드 포스팅", vi: "Đăng Threads" },
    { id: "videoPostPoint", xp: 10, ko: "영상 촬영 및 포스팅", vi: "Quay và đăng video" },
    { id: "tomorrowPlanPoint", xp: 10, ko: "내일 마케팅 기획", vi: "Kế hoạch marketing ngày mai" },
    { id: "marketingReportPoint", xp: 10, ko: "마케팅 성과 보고", vi: "Báo cáo kết quả marketing" },
  ],
};

const defaultRankingSettings = [
  {
    id: "review-award",
    title: "리뷰왕",
    role: "hall",
    missionIds: ["reviewPoint"],
    enabled: true,
    cheer: "리뷰 한 번이 이번 달 트로피에 가까워지는 길이에요.",
    monthlyTrophy: true,
    mark: "⭐",
  },
  {
    id: "upsell-award",
    title: "업셀왕",
    role: "hall",
    missionIds: ["upsellPoint", "recommendedMenuPoint"],
    enabled: true,
    cheer: "추천 성공을 차곡차곡 모아봐요.",
    monthlyTrophy: true,
    mark: "⚡",
  },
  {
    id: "praise-award",
    title: "칭찬왕",
    role: "all",
    missionIds: ["praise"],
    enabled: true,
    cheer: "동료에게 받은 고마움도 멋진 성과예요.",
    monthlyTrophy: true,
    mark: "💬",
  },
  {
    id: "cleaning-award",
    title: "청소왕",
    role: "kitchen",
    missionIds: ["kitchen-performance"],
    enabled: true,
    cheer: "깨끗한 구역을 하나씩 클리어해요.",
    monthlyTrophy: true,
    mark: "✨",
  },
  {
    id: "marketing-award",
    title: "마케팅왕",
    role: "marketer",
    missionIds: ["marketer-performance"],
    enabled: true,
    cheer: "콘텐츠와 보고가 매장의 성장을 만들어요.",
    monthlyTrophy: true,
    mark: "📣",
  },
];

const defaultStaff = [
  { id: "hall-manager", name: "홀 매니저", role: "hall-manager", workDays: allWorkDays, offDays: [], active: true },
  { id: "hall-a", name: "홀직원 A", role: "hall", workDays: allWorkDays, offDays: [], active: true },
  { id: "hall-b", name: "홀직원 B", role: "hall", workDays: allWorkDays, offDays: [], active: true },
  { id: "kitchen-manager", name: "주방 매니저", role: "kitchen-manager", workDays: allWorkDays, offDays: [], active: true },
  { id: "kitchen-a", name: "주방직원 A", role: "kitchen", workDays: allWorkDays, offDays: [], active: true },
  { id: "kitchen-b", name: "주방직원 B", role: "kitchen", workDays: allWorkDays, offDays: [], active: true },
  { id: "marketer-a", name: "마케터 A", role: "marketer", workDays: allWorkDays, offDays: [], active: true },
];

const defaultStoreSettings = {
  storeName: "우리 매장",
  defaultLanguage: "ko",
  rankingVisibility: "private",
  operationPoints: ["추천 메뉴", "리뷰 요청", "멤버십/적립 안내", "피크타임 역할"],
  dailyOperationPoints: [],
  dailyOperationDate: "",
  teamChallengeSettings: {
    enabled: true,
    title: "이번주 팀 챌린지",
    primaryLabel: "리뷰",
    primaryTarget: 30,
    secondaryLabel: "클레임",
  },
  customQuests: [
    { id: "review-photo", title: "리뷰 사진 인증", points: 1, enabled: true },
    { id: "team-help", title: "팀 도와주기", points: 1, enabled: true },
    { id: "sales-xp", title: "판매 성과 XP", points: 1, enabled: true },
  ],
  performanceItems: defaultPerformanceItems,
  rankingSettings: defaultRankingSettings,
  questSettings: {
    attendance: true,
    cleaning: true,
    goal: true,
    photo: true,
    help: true,
    serviceXp: true,
  },
};

const translations = {
  ko: {
    todayRecord: "오늘의 퀘스트",
    languageAria: "언어 선택",
    questStatsAria: "오늘 성장 요약",
    employeeMenuAria: "직원 앱 메뉴",
    operationPointsAria: "오늘 운영 포인트",
    cleanStatusAria: "마감 상태",
    hatiToastTitleDefault: "하티",
    hatiToastMessageDefault: "좋아요!",
    quickCheck: "XP를 모아 레벨업하세요",
    questIntro: "출근과 성과는 실시간으로 남기고, 퇴근 전에는 점검만 제출해요.",
    todayXpLabel: "오늘 예상 XP",
    levelLabel: "누적 레벨",
    streakLabel: "근무 streak",
    dateLabel: "날짜",
    staffLabel: "직원",
    staffHelp: "직원 이름과 근무요일은 관리자 페이지에서 설정합니다.",
    seasonTitle: "시즌 운영 방식",
    seasonText: "주간/월간 랭킹은 새 시즌마다 다시 시작되고, 레벨과 근무 streak는 계속 유지돼요.",
    questProgressLabel: "필수 미션 진행률",
    attendanceTitle: "출근 체크",
    attendanceHelp: "버튼 한 번으로 출근 시간을 기록해요",
    attendancePending: "출근 버튼을 누르면 시간이 바로 표시돼요.",
    attendanceDone: "출근 완료",
    cleaningTitle: "🛡️ 마감 가드",
    cleaningHelp: "오늘 공간을 안전하게 지킨 마지막 퀘스트예요.",
    cleanAssigneePrefix: "오늘 담당",
    cleanStatusPlaceholder: "퇴근 전 상태 선택",
    cleanStatusOk: "이상 없음",
    cleanStatusFixed: "부족한 부분 정리 완료",
    cleanStatusManager: "매니저 확인 필요",
    goalTitle: "🎯 오늘 목표 맵",
    goalHelp: "오늘 집중할 추천 메뉴와 서비스 퀘스트를 열어봐요.",
    goalProofNote: "확인했으면 카드 왼쪽 체크를 눌러주세요.",
    photoLabel: "성과 인증 사진",
    photoHelp: "리뷰, 업셀, 멤버십, 추천메뉴 등 성과가 있으면 인증 사진을 올려주세요. 횟수는 각 성과 버튼으로 기록해요.",
    helpLabel: "칭찬하고 싶은 직원",
    helpHelp: "오늘 고마웠던 동료를 한 명 골라주세요.",
    helpNotePlaceholder: "칭찬 이유를 짧게 적어도 좋아요.",
    noneOption: "칭찬할 직원 선택",
    praiseReasonPlaceholder: "칭찬 이유 선택",
    praiseReasonPeak: "피크타임에 도와줬어요",
    praiseReasonCleaning: "정리/청소를 도와줬어요",
    praiseReasonService: "홀/주방 흐름을 도와줬어요",
    praiseReasonProblem: "문제 해결을 도와줬어요",
    praiseReasonMood: "분위기를 좋게 만들었어요",
    hallHelpOption: "홀 지원",
    kitchenHelpOption: "주방 지원",
    cleanHelpOption: "청소 지원",
    stockHelpOption: "재료/물품 정리",
    peakHelpOption: "피크타임 지원",
    hallPointTitle: "고객 경험 배지",
    hallPointHelp: "고객이 웃은 순간과 추천 성공을 배지처럼 모아요.",
    realtimeTitle: "오늘 획득 배지",
    realtimeHelp: "좋은 순간이 생기면 바로 배지를 획득해요.",
    reviewPoint: "리뷰 미션",
    upsellPoint: "업셀 미션",
    membershipPoint: "멤버십 미션",
    recommendedPoint: "추천메뉴 미션",
    reportXp10: "완료 시 +10 XP",
    reportXp20: "완료 시 +10 XP",
    reportButton: "미션 완료",
    cleanReportButton: "클리어",
    noteLabel: "메모 선택",
    notePlaceholder: "필요할 때만 짧게 적어요",
    finalSubmitTitle: "퇴근 체크하고 제출",
    finalSubmitHelp: "누르면 현재 시간이 퇴근시간으로 자동 기록되고, 오늘 점검이 매니저에게 제출돼요.",
    saveDraftButton: "임시 저장",
    draftReadyStatus: "출근과 성과는 실시간 저장됩니다. 퇴근 전 점검만 마지막에 제출하세요.",
    draftSavedStatus: "임시 저장 완료. 퇴근 전에는 퇴근 전 점검 제출만 눌러주세요.",
    draftLiveStatus: "실시간 저장됨. 퇴근 전 점검 제출 전까지 수정할 수 있어요.",
    draftSelectStaffStatus: "근무 예정 직원을 선택하면 오늘 퀘스트를 저장할 수 있어요.",
    draftRestoredStatus: "오늘 실시간 기록을 불러왔어요. 퇴근 전 점검만 마지막에 제출하세요.",
    draftSubmittedStatus: "제출 완료. 매니저 승인 후 XP가 반영됩니다.",
    reviewPhotoSavedStatus: "인증 사진 {count}장 임시 저장됨",
    reviewPhotoEmptyStatus: "성과 인증 사진을 선택하세요.",
    submitButton: "퇴근 체크하고 제출",
    recentTitle: "최근 퀘스트 기록",
    rankingBundleTitle: "주간 · 월간 랭킹",
    weeklyRankingTitle: "주간 랭킹",
    monthlyRankingTitle: "월간 랭킹",
    scoreOnlyPill: "TOP3 + 내 순위",
    noRanking: "아직 랭킹 기록이 없습니다.",
    rankingPrivate: "랭킹은 매장 설정에서 비공개로 되어 있습니다.",
    noHistory: "제출 기록 없음",
    duplicateAlert: "이미 오늘 퀘스트 또는 KPI 기록이 있습니다.",
    requiredQuestAlert: "필수 미션을 먼저 완료해주세요: ",
    submitAlert: "퀘스트를 제출했습니다. 퇴근시간이 기록됐고, 매니저 승인 후 XP가 반영됩니다.",
    noScheduledStaff: "오늘 근무 예정 직원이 없습니다",
    loadingStaff: "직원 목록을 불러오는 중...",
    weeklyMeta: "최근 7일",
    monthlyMeta: "이번 달",
    daysUnit: "일 기록",
    statusApproved: "승인",
    statusRejected: "반려",
    statusPending: "대기",
    summaryAttendance: "출근",
    summaryCheckout: "퇴근",
    checkoutPending: "퇴근 전 점검을 제출하면 퇴근시간이 자동 기록돼요.",
    checkoutRecorded: "퇴근 자동 기록됨",
    summaryCleaning: "퇴근 전 점검",
    summaryGoal: "운영 포인트 확인",
    roleHallManager: "홀 매니저",
    roleHall: "홀 일반직원",
    roleHallPart: "홀 파트타임",
    roleKitchenManager: "주방 매니저",
    roleKitchen: "주방 일반직원",
    roleKitchenPart: "주방 파트타임",
    roleMarketer: "마케터",
    statusMvp: "MVP급",
    statusGood: "우수",
    statusStable: "안정",
    statusWarning: "도전중",
    emotionRestTitle: "오늘은 recharge day",
    emotionRestText: "근무 예정일이 아니면 streak는 끊기지 않아요. 편하게 쉬어도 됩니다.",
    emotionReadyTitle: "하티가 기다리고 있어요",
    emotionReadyText: "오늘 퀘스트를 하나씩 완료해보세요.",
    emotionStartedTitle: "오늘도 와줘서 고마워요",
    emotionStartedText: "근무 예정일 기준으로 streak가 이어지고 있어요.",
    emotionDoneTitle: "오늘 기록 완료!",
    emotionDoneText: "퇴근 제출 후 매니저 승인이 완료되면 XP가 반영됩니다.",
    levelUpTitle: "축하드려요. 레벨업 하셨습니다!",
    levelUpText: "하티가 한 단계 더 성장했어요.",
  },
  vi: {
    todayRecord: "Nhiệm vụ hôm nay",
    languageAria: "Chọn ngôn ngữ",
    questStatsAria: "Tóm tắt phát triển hôm nay",
    employeeMenuAria: "Menu nhân viên",
    operationPointsAria: "Điểm vận hành hôm nay",
    cleanStatusAria: "Tình trạng cuối ca",
    hatiToastTitleDefault: "HATI",
    hatiToastMessageDefault: "Tốt lắm!",
    quickCheck: "Thu thập XP để lên cấp",
    questIntro: "Chấm công, xem điểm vận hành hôm nay, rồi gửi báo cáo cuối ca.",
    todayXpLabel: "XP dự kiến",
    levelLabel: "Cấp độ tích lũy",
    streakLabel: "Chuỗi ngày làm",
    dateLabel: "Ngày",
    staffLabel: "Nhân viên",
    staffHelp: "Tên nhân viên và lịch làm được cài trong trang quản lý.",
    seasonTitle: "Cách tính mùa",
    seasonText: "Bảng xếp hạng tuần/tháng bắt đầu lại theo mùa. Cấp độ và streak vẫn giữ.",
    questProgressLabel: "Tiến độ nhiệm vụ chính",
    attendanceTitle: "Chấm công",
    attendanceHelp: "Bấm một lần để ghi giờ vào ca",
    attendancePending: "Bấm chấm công để hiện giờ vào ca.",
    attendanceDone: "Đã chấm công",
    cleaningTitle: "🛡️ Nhiệm vụ kết ca",
    cleaningHelp: "Hoàn thành nhiệm vụ bảo vệ khu vực trước khi về.",
    cleanAssigneePrefix: "Phụ trách hôm nay",
    cleanStatusPlaceholder: "Chọn tình trạng trước khi về",
    cleanStatusOk: "Không có vấn đề",
    cleanStatusFixed: "Đã xử lý phần chưa ổn",
    cleanStatusManager: "Cần quản lý kiểm tra",
    goalTitle: "🎯 Bản đồ mục tiêu",
    goalHelp: "Mở món cần tập trung và nhiệm vụ phục vụ hôm nay.",
    goalProofNote: "Nếu đã xem rồi, hãy bấm dấu check bên trái.",
    photoLabel: "Ảnh xác nhận thành tích",
    photoHelp: "Nếu có review, upsell, membership hoặc món đề xuất, hãy tải ảnh xác nhận. Số lượng ghi bằng nút thành tích.",
    helpLabel: "Khen đồng đội",
    helpHelp: "Chọn một đồng đội bạn muốn khen hôm nay.",
    helpNotePlaceholder: "Có thể ghi ngắn lý do khen.",
    noneOption: "Chọn nhân viên muốn khen",
    praiseReasonPlaceholder: "Chọn lý do khen",
    praiseReasonPeak: "Đã hỗ trợ giờ cao điểm",
    praiseReasonCleaning: "Đã hỗ trợ dọn dẹp / vệ sinh",
    praiseReasonService: "Đã hỗ trợ luồng phục vụ / bếp",
    praiseReasonProblem: "Đã hỗ trợ xử lý vấn đề",
    praiseReasonMood: "Làm không khí đội tốt hơn",
    hallHelpOption: "Hỗ trợ phục vụ",
    kitchenHelpOption: "Hỗ trợ bếp",
    cleanHelpOption: "Hỗ trợ vệ sinh",
    stockHelpOption: "Sắp xếp nguyên liệu / đồ dùng",
    peakHelpOption: "Hỗ trợ giờ cao điểm",
    hallPointTitle: "Huy hiệu trải nghiệm khách",
    hallPointHelp: "Thu thập khoảnh khắc khách vui và gợi ý thành công.",
    realtimeTitle: "Huy hiệu hôm nay",
    realtimeHelp: "Khi có khoảnh khắc tốt, bấm để nhận huy hiệu.",
    reviewPoint: "Nhiệm vụ review",
    upsellPoint: "Nhiệm vụ upsell",
    membershipPoint: "Nhiệm vụ membership",
    recommendedPoint: "Nhiệm vụ món đề xuất",
    reportXp10: "Hoàn thành +10 XP",
    reportXp20: "Hoàn thành +10 XP",
    reportButton: "Hoàn thành",
    cleanReportButton: "Clear",
    noteLabel: "Ghi chú tùy chọn",
    notePlaceholder: "Chỉ ghi khi cần",
    submitButton: "Chấm tan ca và gửi",
    recentTitle: "Lịch sử nhiệm vụ",
    rankingBundleTitle: "Xếp hạng tuần · tháng",
    weeklyRankingTitle: "Xếp hạng tuần",
    monthlyRankingTitle: "Xếp hạng tháng",
    scoreOnlyPill: "Top 3 + hạng của tôi",
    noRanking: "Chưa có dữ liệu xếp hạng.",
    rankingPrivate: "Bảng xếp hạng đang để riêng tư.",
    noHistory: "Chưa có lịch sử gửi",
    duplicateAlert: "Hôm nay đã có nhiệm vụ hoặc KPI.",
    requiredQuestAlert: "Hãy hoàn thành nhiệm vụ chính trước: ",
    submitAlert: "Đã chấm tan ca và gửi nhiệm vụ. XP sẽ cộng sau khi quản lý duyệt.",
    noScheduledStaff: "Hôm nay không có nhân viên theo lịch",
    loadingStaff: "Đang tải danh sách nhân viên...",
    weeklyMeta: "7 ngày gần đây",
    monthlyMeta: "Tháng này",
    daysUnit: " ngày ghi nhận",
    statusApproved: "Đã duyệt",
    statusRejected: "Từ chối",
    statusPending: "Chờ duyệt",
    summaryAttendance: "Đi làm",
    summaryCheckout: "Tan ca",
    checkoutPending: "Gửi kiểm tra cuối ca để tự ghi giờ tan ca.",
    checkoutRecorded: "Đã tự ghi giờ tan ca",
    summaryCleaning: "Kiểm tra cuối ca",
    summaryGoal: "Đã xem điểm vận hành",
    roleHallManager: "Quản lý phục vụ",
    roleHall: "Nhân viên phục vụ",
    roleHallPart: "Phục vụ part-time",
    roleKitchenManager: "Quản lý bếp",
    roleKitchen: "Nhân viên bếp",
    roleKitchenPart: "Bếp part-time",
    roleMarketer: "Nhân viên marketing",
    statusMvp: "MVP",
    statusGood: "Tốt",
    statusStable: "Ổn định",
    statusWarning: "Cố gắng",
    emotionRestTitle: "Hôm nay là ngày nạp năng lượng",
    emotionRestText: "Ngày nghỉ theo lịch sẽ không làm mất streak. Hãy nghỉ ngơi nhé.",
    emotionReadyTitle: "Hati đang chờ bạn",
    emotionReadyText: "Hoàn thành từng nhiệm vụ hôm nay nhé.",
    emotionStartedTitle: "Cảm ơn bạn đã đến hôm nay",
    emotionStartedText: "Streak được tính theo ngày làm trong lịch.",
    emotionDoneTitle: "Đã hoàn thành hôm nay!",
    emotionDoneText: "XP sẽ được cộng sau khi quản lý duyệt.",
    levelUpTitle: "Chúc mừng! Bạn đã lên cấp!",
    levelUpText: "HATI đã trưởng thành thêm một bước.",
  },
};

Object.assign(translations.ko, {
  todayRecord: "오늘의 퀘스트",
  languageAria: "언어 선택",
  questStatsAria: "오늘 성장 요약",
  employeeMenuAria: "직원 앱 메뉴",
  operationPointsAria: "오늘 운영 포인트",
  cleanStatusAria: "마감 상태",
  hatiToastTitleDefault: "하티",
  hatiToastMessageDefault: "좋아요!",
  quickCheck: "XP를 모아 레벨업하세요",
  questIntro: "오늘 할 일을 완료하고 매니저 승인 후 XP를 받아요.",
  todayXpLabel: "오늘 예상 XP",
  levelLabel: "누적 레벨",
  streakLabel: "근무 streak",
  dateLabel: "날짜",
  staffLabel: "직원",
  staffHelp: "직원 이름과 근무일은 관리자 페이지에서 설정합니다.",
  seasonTitle: "시즌 운영 방식",
  seasonText: "주간/월간 랭킹은 새 시즌마다 다시 시작하고, 레벨과 근무 streak는 계속 유지됩니다.",
  questProgressLabel: "필수 미션 진행률",
  requiredMissionTitle: "필수 미션은 하루 3개",
  requiredMissionText: "출근 체크 · 근무 시작 목표 확인 · 퇴근 전 점검",
  attendanceTitle: "출근 체크",
  attendanceHelp: "버튼 한 번으로 출근 시간을 기록해요",
  attendancePending: "출근 버튼을 누르면 시간이 바로 표시돼요.",
  attendanceDone: "출근 완료",
  cleaningTitle: "🛡️ 마감 가드",
  cleaningHelp: "오늘 공간을 안전하게 지킨 마지막 퀘스트예요.",
  goalTitle: "🎯 오늘 목표 맵",
  goalHelp: "추천 메뉴, 고객 경험, 팀 흐름까지 오늘의 맵을 먼저 열어봐요.",
  goalProofNote: "확인했으면 카드 왼쪽 체크를 눌러주세요.",
  photoLabel: "성과 인증 사진",
  photoHelp: "리뷰, 업셀, 멤버십, 추천메뉴 등 성과가 있으면 인증 사진을 올려주세요. 횟수는 각 성과 버튼으로 기록해요.",
  helpLabel: "칭찬하고 싶은 직원",
  helpHelp: "오늘 고마웠던 동료를 한 명 골라주세요.",
  helpNotePlaceholder: "칭찬 이유를 짧게 적어도 좋아요.",
  noneOption: "칭찬할 직원 선택",
  praiseReasonPlaceholder: "칭찬 이유 선택",
  praiseReasonPeak: "피크타임에 도와줬어요",
  praiseReasonCleaning: "정리/청소를 도와줬어요",
  praiseReasonService: "홀/주방 흐름을 도와줬어요",
  praiseReasonProblem: "문제 해결을 도와줬어요",
  praiseReasonMood: "분위기를 좋게 만들었어요",
  hallHelpOption: "홀 지원",
  kitchenHelpOption: "주방 지원",
  cleanHelpOption: "청소 지원",
  stockHelpOption: "재료/물품 정리",
  peakHelpOption: "피크타임 지원",
  hallPointTitle: "고객 경험 배지",
  hallPointHelp: "고객이 웃은 순간과 추천 성공을 배지처럼 모아요.",
  kitchenPointTitle: "클린 던전",
  kitchenPointHelp: "특수 구역을 깨끗하게 클리어하면 클린 배지를 얻어요.",
  marketerPointTitle: "콘텐츠 퀘스트",
  marketerPointHelp: "포스팅, 영상, 기획, 보고를 완료할 때마다 성장 배지를 얻어요.",
  realtimeTitle: "오늘 획득 배지",
  realtimeHelp: "좋은 순간이 생기면 바로 배지를 획득해요.",
  reviewPoint: "리뷰 미션",
  upsellPoint: "업셀 미션",
  membershipPoint: "멤버십 미션",
  recommendedPoint: "추천메뉴 미션",
  hygieneFixPoint: "🧹 클린 미션 완료!",
  threadPostPoint: "🧵 쓰레드 퀘스트",
  videoPostPoint: "🎬 영상 퀘스트",
  tomorrowPlanPoint: "🗓️ 내일 작전 준비",
  marketingReportPoint: "📈 성장 보고",
  specialCleanPlaceholder: "특수 청소 구역 선택",
  specialCleanXpHelp: "구역을 고르면 XP가 자동 적용돼요",
  specialCleanLastPlaceholder: "구역을 선택하면 마지막 청소일도 표시돼요",
  specialCleanNoHistory: "최근 청소 기록 없음",
  specialCleanLastToday: "마지막 청소: 오늘",
  specialCleanLastDays: "마지막 청소: {date} · {days}일 전",
  specialCleanRequired: "특수 청소 구역을 먼저 선택해주세요.",
  reportXp10: "완료 시 +10 XP",
  reportXp20: "완료 시 +10 XP",
  reportButton: "미션 완료",
  cleanReportButton: "클리어",
  noteLabel: "메모 선택",
  notePlaceholder: "필요할 때만 짧게 적어요",
  finalSubmitTitle: "퇴근 체크하고 제출",
  finalSubmitHelp: "누르면 현재 시간이 퇴근시간으로 자동 기록되고, 오늘 점검이 매니저에게 제출돼요.",
  saveDraftButton: "임시 저장",
  draftReadyStatus: "출근과 성과는 실시간 저장됩니다. 퇴근 전 점검만 마지막에 제출하세요.",
  draftSavedStatus: "임시 저장 완료. 퇴근 전에는 퇴근 전 점검 제출만 눌러주세요.",
  draftLiveStatus: "실시간 저장됨. 퇴근 전 점검 제출 전까지 수정할 수 있어요.",
  draftSelectStaffStatus: "근무 예정 직원을 선택하면 오늘 퀘스트를 저장할 수 있어요.",
  draftRestoredStatus: "오늘 실시간 기록을 불러왔어요. 퇴근 전 점검만 마지막에 제출하세요.",
  draftSubmittedStatus: "제출 완료. 매니저 승인 후 XP가 반영됩니다.",
  reviewPhotoSavedStatus: "인증 사진 {count}장 임시 저장됨",
  reviewPhotoEmptyStatus: "성과 인증 사진을 선택하세요.",
  submitButton: "퇴근 체크하고 제출",
  recentTitle: "최근 퀘스트 기록",
  rankingBundleTitle: "주간 · 월간 랭킹",
  weeklyRankingTitle: "주간 랭킹",
  monthlyRankingTitle: "월간 랭킹",
  scoreOnlyPill: "TOP3 + 내 순위",
  noRanking: "아직 랭킹 기록이 없습니다.",
  rankingPrivate: "랭킹은 매장 설정에서 비공개로 되어 있습니다.",
  noHistory: "제출 기록 없음",
  duplicateAlert: "이미 오늘 퇴근 전 점검을 제출했습니다.",
  requiredQuestAlert: "필수 미션을 먼저 완료해주세요: ",
  submitAlert: "퇴근 전 점검을 제출했습니다. 퇴근시간이 기록되고, 매니저 승인 후 XP가 반영됩니다.",
  noScheduledStaff: "오늘 근무 예정 직원이 없습니다",
  loadingStaff: "직원 목록을 불러오는 중...",
  weeklyMeta: "최근 7일",
  monthlyMeta: "이번 달",
  daysUnit: "일 기록",
  statusApproved: "승인",
  statusRejected: "반려",
  statusPending: "대기",
  summaryAttendance: "출근",
  summaryCheckout: "퇴근",
  checkoutPending: "퇴근 전 점검을 제출하면 퇴근시간이 자동 기록돼요.",
  checkoutRecorded: "퇴근 자동 기록됨",
  summaryCleaning: "퇴근 전 점검",
  summaryGoal: "근무 시작 목표 확인",
  roleHallManager: "홀 매니저",
  roleHall: "홀 일반직원",
  roleHallPart: "홀 파트타임",
  roleKitchenManager: "주방 매니저",
  roleKitchen: "주방 일반직원",
  roleKitchenPart: "주방 파트타임",
  roleMarketer: "마케터",
  statusMvp: "MVP급",
  statusGood: "우수",
  statusStable: "안정",
  statusWarning: "성장중",
  emotionRestTitle: "오늘은 recharge day",
  emotionRestText: "근무 예정일이 아니면 streak는 끊기지 않아요. 편하게 쉬어도 됩니다.",
  emotionReadyTitle: "하티가 기다리고 있어요",
  emotionReadyText: "오늘 퀘스트를 하나씩 완료해보세요.",
  emotionStartedTitle: "좋아요, 오늘도 시작했어요",
  emotionStartedText: "기록이 쌓이면 XP와 streak가 성장합니다.",
  emotionDoneTitle: "오늘 기록 완료!",
  emotionDoneText: "퇴근 제출 후 매니저 승인이 완료되면 XP가 반영됩니다.",
  levelUpTitle: "축하드려요. 레벨업 하셨습니다!",
  levelUpText: "하티가 한 단계 더 성장했어요.",
  hatiMoodRestTitle: "오늘은 쉬어도 괜찮아요",
  hatiMoodRestText: "근무 예정일이 아니면 streak는 안전하게 유지돼요.",
  hatiMoodReadyTitle: "하티가 기다리는 중",
  hatiMoodReadyText: "출근하면 오늘 게임이 시작돼요.",
  hatiMoodStartedTitle: "에너지 충전 중",
  hatiMoodStartedText: "하나씩 완료할수록 하티가 더 밝아져요.",
  hatiMoodDoneTitle: "오늘 미션 클리어!",
  hatiMoodDoneText: "퇴근 전 제출하면 매니저 승인 후 XP가 반영돼요.",
});

Object.assign(translations.vi, {
  todayRecord: "Nhiệm vụ hôm nay",
  languageAria: "Chọn ngôn ngữ",
  questStatsAria: "Tóm tắt phát triển hôm nay",
  employeeMenuAria: "Menu nhân viên",
  operationPointsAria: "Điểm vận hành hôm nay",
  cleanStatusAria: "Tình trạng cuối ca",
  hatiToastTitleDefault: "HATI",
  hatiToastMessageDefault: "Tốt lắm!",
  quickCheck: "Thu thập XP để lên cấp",
  questIntro: "Hoàn thành việc hôm nay và nhận XP sau khi quản lý duyệt.",
  todayXpLabel: "XP dự kiến hôm nay",
  levelLabel: "Cấp độ tích lũy",
  streakLabel: "Chuỗi ngày làm",
  dateLabel: "Ngày",
  staffLabel: "Nhân viên",
  staffHelp: "Tên nhân viên và lịch làm được cài trong trang quản lý.",
  seasonTitle: "Cách vận hành mùa",
  seasonText: "Xếp hạng tuần/tháng bắt đầu lại theo mùa. Cấp độ và streak vẫn được giữ.",
  questProgressLabel: "Tiến độ nhiệm vụ chính",
  requiredMissionTitle: "Mỗi ngày có 3 nhiệm vụ chính",
  requiredMissionText: "Chấm công · Xem mục tiêu đầu ca · Kiểm tra cuối ca",
  attendanceTitle: "Chấm công",
  attendanceHelp: "Bấm một lần để ghi giờ vào ca",
  attendancePending: "Bấm chấm công để hiển thị giờ vào ca.",
  attendanceDone: "Đã chấm công",
  cleaningTitle: "🛡️ Nhiệm vụ kết ca",
  cleaningHelp: "Hoàn thành nhiệm vụ bảo vệ khu vực trước khi về.",
  cleanAssigneePrefix: "Phụ trách hôm nay",
  cleanStatusPlaceholder: "Chọn tình trạng trước khi về",
  cleanStatusOk: "Không có vấn đề",
  cleanStatusFixed: "Đã xử lý phần chưa ổn",
  cleanStatusManager: "Cần quản lý kiểm tra",
  goalTitle: "🎯 Bản đồ mục tiêu",
  goalHelp: "Mở món cần tập trung, trải nghiệm khách và nhiệm vụ hôm nay.",
  goalProofNote: "Nếu đã xem rồi, hãy bấm dấu check bên trái.",
  photoLabel: "Ảnh xác nhận thành tích",
  photoHelp: "Nếu có review, upsell, membership hoặc món đề xuất, hãy tải ảnh xác nhận. Số lượng ghi bằng nút thành tích.",
  helpLabel: "Khen đồng đội",
  helpHelp: "Chọn một đồng đội bạn muốn khen hôm nay.",
  helpNotePlaceholder: "Có thể ghi ngắn lý do khen.",
  noneOption: "Chọn nhân viên muốn khen",
  praiseReasonPlaceholder: "Chọn lý do khen",
  praiseReasonPeak: "Đã hỗ trợ giờ cao điểm",
  praiseReasonCleaning: "Đã hỗ trợ dọn dẹp / vệ sinh",
  praiseReasonService: "Đã hỗ trợ luồng phục vụ / bếp",
  praiseReasonProblem: "Đã hỗ trợ xử lý vấn đề",
  praiseReasonMood: "Làm không khí đội tốt hơn",
  hallHelpOption: "Hỗ trợ phục vụ",
  kitchenHelpOption: "Hỗ trợ bếp",
  cleanHelpOption: "Hỗ trợ vệ sinh",
  stockHelpOption: "Sắp xếp nguyên liệu / đồ dùng",
  peakHelpOption: "Hỗ trợ giờ cao điểm",
  hallPointTitle: "Huy hiệu trải nghiệm khách",
  hallPointHelp: "Thu thập khoảnh khắc khách vui và gợi ý thành công.",
  kitchenPointTitle: "Dungeon vệ sinh",
  kitchenPointHelp: "Clear khu vực đặc biệt để nhận huy hiệu sạch sẽ.",
  marketerPointTitle: "Nhiệm vụ nội dung",
  marketerPointHelp: "Hoàn thành bài đăng, video, kế hoạch và báo cáo để nhận huy hiệu.",
  realtimeTitle: "Huy hiệu hôm nay",
  realtimeHelp: "Khi có khoảnh khắc tốt, bấm để nhận huy hiệu.",
  reviewPoint: "Nhiệm vụ review",
  upsellPoint: "Nhiệm vụ upsell",
  membershipPoint: "Nhiệm vụ membership",
  recommendedPoint: "Nhiệm vụ món đề xuất",
  hygieneFixPoint: "🧹 Nhiệm vụ vệ sinh clear!",
  threadPostPoint: "🧵 Nhiệm vụ Threads",
  videoPostPoint: "🎬 Nhiệm vụ video",
  tomorrowPlanPoint: "🗓️ Chuẩn bị kế hoạch",
  marketingReportPoint: "📈 Báo cáo tăng trưởng",
  specialCleanPlaceholder: "Chọn khu vực vệ sinh đặc biệt",
  specialCleanXpHelp: "Chọn khu vực để tự áp dụng XP.",
  specialCleanLastPlaceholder: "Chọn khu vực để xem lần vệ sinh gần nhất.",
  specialCleanNoHistory: "Chưa có lịch sử vệ sinh gần đây",
  specialCleanLastToday: "Lần gần nhất: hôm nay",
  specialCleanLastDays: "Lần gần nhất: {date} · {days} ngày trước",
  specialCleanRequired: "Vui lòng chọn khu vực vệ sinh đặc biệt trước.",
  reportXp10: "Hoàn thành +10 XP",
  reportXp20: "Hoàn thành +10 XP",
  reportButton: "Hoàn thành",
  cleanReportButton: "Clear",
  noteLabel: "Ghi chú tùy chọn",
  notePlaceholder: "Chỉ ghi ngắn khi cần",
  finalSubmitTitle: "Chấm tan ca và gửi",
  finalSubmitHelp: "Bấm nút này để ghi giờ hiện tại là giờ tan ca và gửi kiểm tra hôm nay cho quản lý.",
  saveDraftButton: "Lưu tạm",
  draftReadyStatus: "Chấm công và thành tích được lưu ngay. Cuối ca chỉ cần gửi phần kiểm tra.",
  draftSavedStatus: "Đã lưu tạm. Trước khi về chỉ cần bấm gửi kiểm tra cuối ca.",
  draftLiveStatus: "Đã lưu ngay. Bạn có thể sửa trước khi gửi kiểm tra cuối ca.",
  draftSelectStaffStatus: "Hãy chọn nhân viên có lịch làm để lưu nhiệm vụ hôm nay.",
  draftRestoredStatus: "Đã tải lại ghi nhận hôm nay. Cuối ca chỉ cần gửi phần kiểm tra.",
  draftSubmittedStatus: "Đã gửi. XP sẽ được cộng sau khi quản lý duyệt.",
  reviewPhotoSavedStatus: "Đã lưu tạm {count} ảnh xác nhận",
  reviewPhotoEmptyStatus: "Hãy chọn ảnh xác nhận thành tích.",
  submitButton: "Chấm tan ca và gửi",
  recentTitle: "Lịch sử nhiệm vụ",
  rankingBundleTitle: "Xếp hạng tuần · tháng",
  weeklyRankingTitle: "Xếp hạng tuần",
  monthlyRankingTitle: "Xếp hạng tháng",
  scoreOnlyPill: "Top 3 + hạng của tôi",
  noRanking: "Chưa có dữ liệu xếp hạng.",
  rankingPrivate: "Xếp hạng đang để riêng tư.",
  noHistory: "Chưa có lịch sử gửi",
  duplicateAlert: "Hôm nay đã gửi kiểm tra cuối ca.",
  requiredQuestAlert: "Vui lòng hoàn thành nhiệm vụ chính: ",
  submitAlert: "Đã chấm tan ca và gửi kiểm tra cuối ca. XP sẽ cộng sau khi quản lý duyệt.",
  noScheduledStaff: "Hôm nay không có nhân viên theo lịch",
  loadingStaff: "Đang tải danh sách nhân viên...",
  weeklyMeta: "7 ngày gần đây",
  monthlyMeta: "Tháng này",
  daysUnit: " ngày ghi nhận",
  statusApproved: "Đã duyệt",
  statusRejected: "Từ chối",
  statusPending: "Chờ duyệt",
  summaryAttendance: "Vào ca",
  summaryCheckout: "Tan ca",
  checkoutPending: "Gửi kiểm tra cuối ca để tự ghi giờ tan ca.",
  checkoutRecorded: "Đã ghi giờ tan ca",
  summaryCleaning: "Kiểm tra cuối ca",
  summaryGoal: "Đã xem mục tiêu đầu ca",
  roleHallManager: "Quản lý phục vụ",
  roleHall: "Nhân viên phục vụ",
  roleHallPart: "Phục vụ part-time",
  roleKitchenManager: "Quản lý bếp",
  roleKitchen: "Nhân viên bếp",
  roleKitchenPart: "Bếp part-time",
  roleMarketer: "Nhân viên marketing",
  statusMvp: "MVP",
  statusGood: "Tốt",
  statusStable: "Ổn định",
  statusWarning: "Đang cố gắng",
  emotionRestTitle: "Hôm nay là ngày nạp năng lượng",
  emotionRestText: "Ngày nghỉ theo lịch sẽ không làm mất streak.",
  emotionReadyTitle: "HATI đang chờ bạn",
  emotionReadyText: "Hãy hoàn thành từng nhiệm vụ hôm nay.",
  emotionStartedTitle: "Tốt lắm, hôm nay bắt đầu rồi",
  emotionStartedText: "Ghi nhận sẽ giúp XP và streak tăng lên.",
  emotionDoneTitle: "Đã hoàn thành hôm nay!",
  emotionDoneText: "XP sẽ được cộng sau khi quản lý duyệt.",
  levelUpTitle: "Chúc mừng! Bạn đã lên cấp!",
  levelUpText: "HATI đã trưởng thành thêm một bước.",
  hatiMoodRestTitle: "Hôm nay cứ nghỉ nhé",
  hatiMoodRestText: "Ngày nghỉ theo lịch không làm mất streak.",
  hatiMoodReadyTitle: "HATI đang đợi bạn",
  hatiMoodReadyText: "Chấm công là bắt đầu trò chơi hôm nay.",
  hatiMoodStartedTitle: "Đang nạp năng lượng",
  hatiMoodStartedText: "Hoàn thành từng bước, HATI sẽ sáng hơn.",
  hatiMoodDoneTitle: "Hoàn thành nhiệm vụ!",
  hatiMoodDoneText: "Gửi cuối ca để quản lý duyệt và cộng XP.",
});

let state = loadState();
let staff = normalizeStaff(state.staff);
let photos = [];
let attendanceTime = "";
let checkoutTime = "";
let checkinMood = "";
let pendingCheckinAfterMood = false;
let praiseSkipped = false;
let lastSubmitFeedback = null;
let attendancePraiseKey = "";
let lastRenderedXp = null;
let activeLevelUpNotice = null;
let checkoutSubmitLocked = false;
let cloudSaveRevision = 0;
let cloudStaffLoaded = false;
let cloudSyncPromise = Promise.resolve(false);
const questPraiseKeys = new Set();
let currentLang = localStorage.getItem(langStorageKey) || normalizeStoreSettings(state.storeSettings).defaultLanguage || "ko";
const pageParams = new URLSearchParams(window.location.search);
const lockedStaffId = pageParams.get("staff") || pageParams.get("id") || "";
const lockedStaffToken = pageParams.get("token") || "";
const lockedStaffName = pageParams.get("name") || "";
const lockedStaffRole = pageParams.get("role") || "";
const isPreviewMode = pageParams.get("preview") === "1" || pageParams.get("admin") === "1";
const isFreshTestMode = isPreviewMode && ["1", "true", "yes"].includes(String(pageParams.get("fresh") || "").toLowerCase());

function appStorageKey() {
  return window.LeveloveAuth?.stateStorageKey?.(storageKey) || storageKey;
}

const els = {
  form: document.querySelector("#selfCheckForm"),
  date: document.querySelector("#checkDate"),
  staffSelect: document.querySelector("#checkStaffSelect"),
  lockedStaffCard: document.querySelector("#lockedStaffCard"),
  lockedStaffEyebrow: document.querySelector("#lockedStaffEyebrow"),
  lockedStaffName: document.querySelector("#lockedStaffName"),
  lockedStaffRole: document.querySelector("#lockedStaffRole"),
  attendance: document.querySelector("#attendanceCheck"),
  attendanceTimeText: document.querySelector("#attendanceTimeText"),
  checkoutTimeText: document.querySelector("#checkoutTimeText"),
  cleaning: document.querySelector("#cleaningCheck"),
  cleanArea: document.querySelector("#cleanAreaSelect"),
  closeAreaText: document.querySelector("#closeAreaText"),
  cleanStatus: document.querySelector("#cleanStatusSelect"),
  goal: document.querySelector("#goalCheck"),
  operationPointList: document.querySelector("#operationPointList"),
  photoInput: document.querySelector("#photoInput"),
  photoCard: document.querySelector("#questPhotoCard"),
  photoPreview: document.querySelector("#photoPreview"),
  reviewUploadStatus: document.querySelector("#reviewUploadStatus"),
  helpType: document.querySelector("#helpType"),
  helpReason: document.querySelector("#helpReason"),
  helpCount: document.querySelector("#helpCount"),
  helpNote: document.querySelector("#helpNoteInput"),
  praiseCompleteButton: document.querySelector("#praiseCompleteButton"),
  praiseSkipButton: document.querySelector("#praiseSkipButton"),
  realtimeTitle: document.querySelector("[data-i18n='realtimeTitle']"),
  realtimeHelp: document.querySelector("[data-i18n='realtimeHelp']"),
  hallPointBox: document.querySelector("#hallPointBox"),
  kitchenPointBox: document.querySelector("#kitchenPointBox"),
  marketerPointBox: document.querySelector("#marketerPointBox"),
  hallPerformanceGrid: document.querySelector("#hallPointBox .realtime-grid"),
  kitchenPerformanceGrid: document.querySelector("#kitchenPointBox .realtime-grid"),
  marketerPerformanceGrid: document.querySelector("#marketerPointBox .realtime-grid"),
  reviewPoint: document.querySelector("#reviewPoint"),
  upsellPoint: document.querySelector("#upsellPoint"),
  membershipPoint: document.querySelector("#membershipPoint"),
  recommendedMenuPoint: document.querySelector("#recommendedMenuPoint"),
  hygieneFixPoint: document.querySelector("#hygieneFixPoint"),
  threadPostPoint: document.querySelector("#threadPostPoint"),
  videoPostPoint: document.querySelector("#videoPostPoint"),
  tomorrowPlanPoint: document.querySelector("#tomorrowPlanPoint"),
  marketingReportPoint: document.querySelector("#marketingReportPoint"),
  specialCleanArea: document.querySelector("#specialCleanArea"),
  specialCleanXpLabel: document.querySelector("#specialCleanXpLabel"),
  specialCleanLastStatus: document.querySelector("#specialCleanLastStatus"),
  note: document.querySelector("#selfCheckNote"),
  saveDraftButton: document.querySelector("#saveDraftButton"),
  draftStatus: document.querySelector("#draftStatus"),
  history: document.querySelector("#selfCheckHistory"),
  weeklyRanking: document.querySelector("#employeeWeeklyRanking"),
  monthlyRanking: document.querySelector("#employeeMonthlyRanking"),
  todayXp: document.querySelector("#todayXp"),
  questLevel: document.querySelector("#questLevel"),
  questStreak: document.querySelector("#questStreak"),
  questProgressText: document.querySelector("#questProgressText"),
  questProgressFill: document.querySelector("#questProgressFill"),
  emotionTitle: document.querySelector("#emotionTitle"),
  emotionText: document.querySelector("#emotionText"),
  hatiToast: document.querySelector("#hatiToast"),
  hatiToastTitle: document.querySelector("#hatiToastTitle"),
  hatiToastMessage: document.querySelector("#hatiToastMessage"),
  xpBurst: document.querySelector("#xpBurst"),
  heroXpChip: document.querySelector("#heroXpChip"),
  hatiMoodTitle: document.querySelector("#hatiMoodTitle"),
  hatiMoodText: document.querySelector("#hatiMoodText"),
  announcementCard: document.querySelector("#announcementCard"),
  announcementType: document.querySelector("#announcementType"),
  announcementTitle: document.querySelector("#announcementTitle"),
  announcementMessage: document.querySelector("#announcementMessage"),
  langButtons: [...document.querySelectorAll("[data-lang]")],
  employeePhone: document.querySelector(".employee-phone"),
  employeeTabPanel: document.querySelector("#employeeTabPanel"),
  employeeTabContent: document.querySelector("#employeeTabContent"),
  employeeTabButtons: [...document.querySelectorAll("[data-employee-tab]")],
  questCards: {
    attendance: document.querySelector("#questAttendanceCard"),
    cleaning: document.querySelector("#questCleaningCard"),
    goal: document.querySelector("#questGoalCard"),
    photo: document.querySelector("#questPhotoCard"),
    help: document.querySelector("#questHelpCard"),
  },
};

init();

function init() {
  const authResult = window.LeveloveAuth?.requireRole?.(["owner", "admin", "manager", "employee"], { allowPreview: isPreviewMode });
  if (authResult && !authResult.ok) return;
  els.date.value = urlDateParam() || toInputDate(new Date());
  relocatePhotoProofCard();
  applyLanguage();
  renderStaffOptions();
  updateRoleFields();
  applyQuestSettings();
  renderHistory();
  renderRankings();
  renderAnnouncement();
  renderOperationPoints();
  updateQuestProgress();
  cloudSyncPromise = syncCloudState();

  els.staffSelect.addEventListener("change", () => {
    restoreDraft();
    updateRoleFields();
    renderHistory();
    renderRankings();
    updateQuestProgress();
  });
  els.date.addEventListener("change", () => {
    renderStaffOptions();
    restoreDraft();
    renderHistory();
    updateQuestProgress();
  });
  els.attendance.addEventListener("change", handleAttendanceToggle);
  els.goal?.addEventListener("change", handleGoalToggle);
  [els.cleanArea, els.cleanStatus].forEach((field) => {
    field?.addEventListener("change", () => {
      const wasDone = cleaningQuestDone();
      els.cleaning.checked = Boolean(els.cleanArea?.value || els.cleanStatus?.value);
      if (!wasDone && cleaningQuestDone()) praiseOnce("cleaning");
      updateQuestProgress();
      saveDraft({ showMessage: false });
      saveLiveSelfCheck();
    });
  });
  els.photoInput.addEventListener("change", readPhoto);
  els.photoPreview?.addEventListener("click", handlePhotoPreviewClick);
  els.helpType?.addEventListener("change", handleHelpChange);
  els.helpReason?.addEventListener("change", handleHelpChange);
  els.helpNote?.addEventListener("input", handleHelpChange);
  els.praiseCompleteButton?.addEventListener("click", completePraise);
  els.praiseSkipButton?.addEventListener("click", skipPraise);
  els.saveDraftButton?.addEventListener("click", () => saveDraft({ showMessage: true }));
  els.form.addEventListener("submit", submitSelfCheck);
  els.form.addEventListener("click", handleVisibleSubmitClick);
  els.form.addEventListener("click", handleRealtimeAdjust);
  els.form.addEventListener("pointerdown", handleVisibleSubmitPointerDown);
  els.form.addEventListener("change", (event) => {
    syncLegacyPerformanceFields();
    updateSpecialCleanLastStatus();
    updateQuestProgress();
    saveDraft({ showMessage: false });
    saveLiveSelfCheck();
  });
  els.form.addEventListener("input", () => {
    updateQuestProgress();
    saveDraft({ showMessage: false });
  });
  els.employeeTabContent?.addEventListener("click", (event) => {
    const languageButton = event.target.closest("[data-lang]");
    if (languageButton) {
      event.preventDefault();
      setLanguage(languageButton.dataset.lang);
      return;
    }
    const submitButton = event.target.closest("[data-submit-checkout]");
    if (submitButton) {
      submitCheckoutFromMobileAction(event, submitButton);
      return;
    }
    const guardInput = event.target.closest("[data-checkout-guard]")
      || event.target.closest("label")?.querySelector("[data-checkout-guard]");
    if (guardInput) {
      event.preventDefault();
      completeCheckoutGuard();
      focusCheckoutSubmitButton();
      return;
    }
    const checkinButton = event.target.closest("[data-checkin-action]");
    if (checkinButton) {
      event.preventDefault();
      handleCheckinPageAction();
      return;
    }
    const moodButton = event.target.closest("[data-checkin-mood]");
    if (moodButton) {
      event.preventDefault();
      handleCheckinMoodSelect(moodButton.dataset.checkinMood || "");
      return;
    }
    const goalConfirmButton = event.target.closest("[data-goal-confirm]");
    if (goalConfirmButton) {
      event.preventDefault();
      markGoalConfirmed();
      return;
    }
    const performanceMissionButton = event.target.closest("[data-performance-mission]");
    if (performanceMissionButton) {
      event.preventDefault();
      completePerformanceMission(performanceMissionButton);
      return;
    }
    const praiseTargetButton = event.target.closest("[data-praise-target]");
    if (praiseTargetButton) {
      event.preventDefault();
      selectPraiseTarget(praiseTargetButton);
      return;
    }
    const praiseOptionButton = event.target.closest("[data-praise-option]");
    if (praiseOptionButton) {
      event.preventDefault();
      sendPraiseOption(praiseOptionButton);
      return;
    }
    const awardButton = event.target.closest("[data-award-category]");
    if (awardButton) {
      event.preventDefault();
      handleAwardCategoryClick(awardButton);
      return;
    }
    const button = event.target.closest("[data-jump-tab]");
    if (!button) return;
    setEmployeeTab(button.dataset.jumpTab);
  });
  els.employeeTabContent?.addEventListener("pointerdown", (event) => {
    const submitButton = event.target.closest("[data-submit-checkout]");
    if (!submitButton || event.pointerType === "mouse") return;
    submitCheckoutFromMobileAction(event, submitButton);
  });
  els.employeeTabContent?.addEventListener("change", handleProfilePhotoChange);
  els.employeeTabContent?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const checkinButton = event.target.closest("[data-checkin-action]");
    if (checkinButton) {
      event.preventDefault();
      handleCheckinPageAction();
      return;
    }
    const button = event.target.closest("[data-jump-tab]");
    if (!button) return;
    event.preventDefault();
    setEmployeeTab(button.dataset.jumpTab);
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
  els.employeeTabButtons.forEach((button) => {
    button.addEventListener("click", () => setEmployeeTab(button.dataset.employeeTab));
  });
  setEmployeeTab(pageParams.get("tab") || "home", { scroll: false });
  restoreDraft();
  renderCheckoutTime();
  trackEmployeeEvent("link_opened", {
    page: "employee",
    source: lockedStaffId ? "staff_link" : isPreviewMode ? "preview" : "employee_app",
  });
}

function submitCheckoutFromMobileAction(event, button) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
  if (button?.disabled || checkoutSubmitLocked) return;
  checkoutSubmitLocked = true;
  if (button) {
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
  }
  setDraftStatus(currentLang === "vi" ? "Đang gửi kiểm tra cuối ca..." : "퇴근 제출 중...");
  completeCheckoutGuard({ skipAutosave: true, quiet: true });
  submitSelfCheck({ preventDefault() {} })
    .catch((error) => {
      console.warn(error);
      if (hasPendingSelfCheckForCurrentStaff()) {
        setDraftStatus(t("draftSubmittedStatus"));
        try {
          setEmployeeTab("home", { scroll: false });
        } catch (tabError) {
          console.warn(tabError);
        }
        return;
      }
      const message = currentLang === "vi"
        ? "Chưa gửi được. Vui lòng bấm lại một lần nữa."
        : "아직 제출되지 않았어요. 한 번만 다시 눌러주세요.";
      setDraftStatus(message);
      alert(message);
    })
    .finally(() => {
      checkoutSubmitLocked = false;
      if (button?.isConnected) {
        button.disabled = false;
        button.removeAttribute("aria-busy");
      }
    });
}

function handleVisibleSubmitClick(event) {
  const button = event.target.closest(".submit-self-check");
  if (!button) return;
  submitCheckoutFromMobileAction(event, button);
}

function handleVisibleSubmitPointerDown(event) {
  if (event.pointerType === "mouse") return;
  const button = event.target.closest(".submit-self-check");
  if (!button) return;
  submitCheckoutFromMobileAction(event, button);
}

function hasPendingSelfCheckForCurrentStaff() {
  const person = selectedStaff();
  const date = els.date?.value || "";
  if (!person || !date) return false;
  return (state.selfChecks || []).some((entry) => (
    entry.date === date && entry.staffId === person.id && entry.status === "pending"
  ));
}

function completePerformanceMission(button) {
  const fieldId = button.dataset.performanceMission;
  const item = performanceItemById(fieldId);
  const input = fieldId ? ensureLaunchPerformanceInput(fieldId, item) : null;
  if (!input) return;
  input.value = "1";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  button.classList.add("is-complete");
  button.textContent = currentLang === "vi" ? "Đã hoàn thành ✓" : "완료됨 ✓";
  showHatiPraise(fieldId);
  trackTaskCompleted(fieldId, { taskName: performanceItemLabel(item) });
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
  renderEmployeeTabContent("performance", questDoneState(), selectedStaff());
}

function selectPraiseTarget(button) {
  const root = button.closest(".peer-praise-card");
  if (!root) return;
  root.querySelectorAll("[data-praise-target]").forEach((target) => target.classList.toggle("is-selected", target === button));
  root.querySelectorAll("[data-praise-option]").forEach((option) => option.classList.remove("is-complete"));
  const feedback = root.querySelector("[data-praise-feedback]");
  if (feedback) {
    const target = button.dataset.praiseTarget || (currentLang === "vi" ? "đồng đội" : "동료");
    feedback.textContent = currentLang === "vi"
      ? `Đã chọn ${target}. Hãy chọn lý do khen.`
      : `${target}님을 선택했어요. 칭찬 이유를 골라주세요.`;
  }
}

function sendPraiseOption(button) {
  const root = button.closest(".peer-praise-card");
  if (!root) return;
  const selected = root.querySelector("[data-praise-target].is-selected");
  const target = selected?.dataset.praiseTarget || (currentLang === "vi" ? "đồng đội" : "동료");
  const targetId = selected?.dataset.praiseTargetId || "";
  if (!targetId) return;
  root.querySelectorAll("[data-praise-option]").forEach((option) => option.classList.toggle("is-complete", option === button));
  if (els.helpType) els.helpType.value = targetId;
  if (els.helpReason) els.helpReason.value = button.dataset.praiseOption || "mood";
  if (els.helpNote) els.helpNote.value = `${target}: ${button.textContent.trim()}`;
  [els.helpType, els.helpReason, els.helpNote].forEach((field) => field?.dispatchEvent(new Event("change", { bubbles: true })));
  const feedback = root.querySelector("[data-praise-feedback]");
  if (feedback) {
    feedback.textContent = currentLang === "vi"
      ? `Đã gửi lời khen cho ${target}.`
      : `${target}님에게 칭찬을 보냈어요.`;
    feedback.classList.add("is-visible");
  }
  showHatiPraise("help");
}

function handleAwardCategoryClick(button) {
  const root = button.closest(".employee-performance-rankings");
  if (!root) return;
  const category = button.dataset.awardCategory;
  root.querySelectorAll("[data-award-category]").forEach((item) => {
    const isActive = item === button;
    item.classList.toggle("is-active", isActive);
    item.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  root.querySelectorAll("[data-award-board]").forEach((board) => {
    board.classList.toggle("is-active", board.dataset.awardBoard === category);
  });
}

function loadState() {
  const fallback = {
    staff: defaultStaff,
    personalEntries: [],
    teamEntries: [],
    selfChecks: [],
    announcements: [],
    analyticsEvents: [],
    storeSettings: defaultStoreSettings,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(appStorageKey()));
    return {
      ...fallback,
      ...saved,
      storeSettings: normalizeStoreSettings(saved?.storeSettings),
      selfChecks: saved?.selfChecks || [],
      announcements: saved?.announcements || [],
      analyticsEvents: normalizeAnalyticsEvents(saved?.analyticsEvents),
    };
  } catch {
    return fallback;
  }
}

function saveState(options = {}) {
  state.staff = staff;
  state.selfChecks = state.selfChecks || [];
  state.analyticsEvents = normalizeAnalyticsEvents(state.analyticsEvents);
  return saveEmployeeStateEverywhere(state, options);
}

function trackEmployeeEvent(type, detail = {}) {
  const person = selectedStaff();
  const event = appendAnalyticsEvent(state, type, {
    actorRole: "employee",
    staffId: person?.id || lockedStaffId || "",
    staffName: person ? visibleStaffName(person, 0) : lockedStaffName,
    role: person?.role || lockedStaffRole || "",
    date: els.date?.value || toInputDate(new Date()),
    ...detail,
  });
  if (event) return saveState();
  return Promise.resolve(false);
}

function trackTaskCompleted(taskId, detail = {}) {
  const person = selectedStaff();
  if (!taskId || !person) return Promise.resolve(false);
  return trackEmployeeEvent("task_completed", {
    taskId,
    dedupeKey: `${els.date.value || toInputDate(new Date())}:${person.id}:${taskId}`,
    ...detail,
  });
}

function saveEmployeeStateEverywhere(nextState, options = {}) {
  localStorage.setItem(appStorageKey(), JSON.stringify(nextState));
  if (typeof cloudEnabled !== "function" || !cloudEnabled()) return Promise.resolve(true);
  const person = selectedStaff();
  const date = els.date.value;
  const saveRevision = ++cloudSaveRevision;
  const timeoutMs = options.critical ? cloudCriticalSaveTimeoutMs : cloudReadTimeoutMs;
  const snapshot = {
    ...nextState,
    selfChecks: [...(nextState.selfChecks || [])],
  };

  return withTimeout(loadStateFromCloud(), timeoutMs)
    .then((cloudState) => {
      if (saveRevision !== cloudSaveRevision) return false;
      const mergedState = mergeEmployeeStateForCloud(cloudState, snapshot, person, date);
      localStorage.setItem(appStorageKey(), JSON.stringify(mergedState));
      return saveStateToCloud(mergedState).then(() => true);
    })
    .catch((error) => {
      console.warn(error);
      return false;
    });
}

function mergeEmployeeStateForCloud(cloudState, localState, person, date) {
  if (!cloudState) return localState;
  if (!person || !date) {
    return {
      ...cloudState,
      selfChecks: cloudState.selfChecks || [],
      analyticsEvents: mergeAnalyticsEvents(cloudState.analyticsEvents, localState.analyticsEvents),
    };
  }

  const cloudChecks = Array.isArray(cloudState.selfChecks) ? cloudState.selfChecks : [];
  const localChecks = Array.isArray(localState.selfChecks) ? localState.selfChecks : [];
  const sameCloudFinals = cloudChecks.filter((entry) => (
    entry.date === date &&
    entry.staffId === person.id &&
    ["pending", "approved", "rejected"].includes(entry.status)
  ));
  const cloudBlockingFinalExists = sameCloudFinals.some((entry) => ["pending", "approved"].includes(entry.status));
  const latestCloudFinalTime = sameCloudFinals.reduce((latest, entry) => Math.max(latest, selfCheckVersionTime(entry)), 0);
  const localMine = cloudBlockingFinalExists
    ? []
    : localChecks
      .filter((entry) => entry.date === date && entry.staffId === person.id)
      .filter((entry) => !sameCloudFinals.length || selfCheckVersionTime(entry) > latestCloudFinalTime);
  const untouchedCloud = cloudChecks.filter((entry) => !(entry.date === date && entry.staffId === person.id && entry.status === "live"));

  return {
    ...cloudState,
    selfChecks: upsertChecksById([...untouchedCloud, ...localMine]),
    analyticsEvents: mergeAnalyticsEvents(cloudState.analyticsEvents, localState.analyticsEvents),
  };
}

function recoverLocalPendingSelfChecksForCloud(cloudState, localState) {
  if (!cloudState || isPreviewMode) return { state: cloudState, recoveredCount: 0 };
  const date = els.date?.value || toInputDate(new Date());
  const cloudChecks = Array.isArray(cloudState.selfChecks) ? cloudState.selfChecks : [];
  const localChecks = Array.isArray(localState.selfChecks) ? localState.selfChecks : [];
  const recovered = [];

  localChecks.forEach((entry) => {
    if (!entry || entry.date !== date || entry.status !== "pending") return;
    if (!localSelfCheckBelongsToCurrentLink(entry)) return;
    const person = canonicalStaffForRecoveredCheck(entry, cloudState);
    if (!person) return;
    const alreadyInCloud = cloudChecks.some((cloudEntry) => (
      cloudEntry.date === entry.date &&
      cloudEntry.staffId === person.id &&
      ["pending", "approved"].includes(cloudEntry.status)
    ));
    if (alreadyInCloud) return;
    recovered.push({
      ...entry,
      staffId: person.id,
      staffName: visibleStaffName(person, 0),
      role: person.role,
      roleName: roleLabel(person.role),
      status: "pending",
      updatedAt: new Date().toISOString(),
      recoveredFromLocalAt: new Date().toISOString(),
    });
  });

  if (!recovered.length) {
    return {
      state: {
        ...cloudState,
        analyticsEvents: mergeAnalyticsEvents(cloudState.analyticsEvents, localState.analyticsEvents),
      },
      recoveredCount: 0,
    };
  }

  return {
    state: {
      ...cloudState,
      selfChecks: upsertChecksById([...cloudChecks, ...recovered]),
      analyticsEvents: mergeAnalyticsEvents(cloudState.analyticsEvents, localState.analyticsEvents),
    },
    recoveredCount: recovered.length,
  };
}

function localSelfCheckBelongsToCurrentLink(entry) {
  if (!lockedStaffId && !lockedStaffName) return false;
  if (entry.staffId && lockedStaffId && entry.staffId === lockedStaffId) return true;
  const entryName = staffIdentityKey(entry.staffName);
  const linkName = staffIdentityKey(lockedStaffName);
  if (!entryName || !linkName || !namesLookLikeSameStaff(entryName, linkName)) return false;
  return rolesShareStaffGroup(entry.role || lockedStaffRole, lockedStaffRole || entry.role || "hall");
}

function canonicalStaffForRecoveredCheck(entry, cloudState) {
  const people = Array.isArray(cloudState.staff)
    ? normalizeStaff(cloudState.staff).filter((person) => person.active !== false && !isManagerRole(person.role))
    : [];
  const exact = people.find((person) => person.id === entry.staffId || person.id === lockedStaffId);
  if (exact) return exact;

  const entryName = staffIdentityKey(entry.staffName || lockedStaffName);
  const entryRole = entry.role || lockedStaffRole || "hall";
  const candidates = people.filter((person) => (
    rolesShareStaffGroup(person.role, entryRole) &&
    namesLookLikeSameStaff(staffIdentityKey(person.name), entryName)
  ));
  if (candidates.length === 1) return candidates[0];
  if (lockedStaffId && lockedStaffToken) return lockedStaffFromUrl();
  return undefined;
}

function upsertChecksById(entries) {
  const map = new Map();
  entries.forEach((entry) => {
    const key = entry.id || `${entry.date}::${entry.staffId}::${entry.status || "pending"}`;
    const previous = map.get(key);
    if (!previous || selfCheckVersionTime(entry) >= selfCheckVersionTime(previous)) {
      map.set(key, entry);
    }
  });
  return [...map.values()];
}

function selfCheckVersionTime(entry) {
  const value = entry?.updatedAt || entry?.approvedAt || entry?.rejectedAt || entry?.submittedAt || entry?.createdAt || "";
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : 0;
}

async function syncCloudState() {
  try {
    const cloudState = await withTimeout(loadStateFromCloud(), cloudReadTimeoutMs);
    if (!cloudState) {
      renderStaffOptions();
      return false;
    }
    cloudStaffLoaded = true;
    const localSnapshot = {
      ...state,
      selfChecks: [...(state.selfChecks || [])],
      analyticsEvents: normalizeAnalyticsEvents(state.analyticsEvents),
    };
    const recovery = recoverLocalPendingSelfChecksForCloud(cloudState, localSnapshot);
    const incomingCloudState = recovery.state || cloudState;
    if (recovery.recoveredCount > 0) {
      try {
        await withTimeout(saveStateToCloud(incomingCloudState), cloudCriticalSaveTimeoutMs);
      } catch (error) {
        console.warn(error);
      }
    }
    const localAnalyticsEvents = localSnapshot.analyticsEvents;
    state = {
      ...state,
      ...incomingCloudState,
      storeSettings: normalizeStoreSettings(incomingCloudState.storeSettings),
      selfChecks: incomingCloudState.selfChecks || [],
      announcements: Array.isArray(incomingCloudState.announcements) ? incomingCloudState.announcements : (state.announcements || []),
      analyticsEvents: mergeAnalyticsEvents(localAnalyticsEvents, incomingCloudState.analyticsEvents),
    };
    staff = normalizeStaff(state.staff);
    if (!localStorage.getItem(langStorageKey)) currentLang = state.storeSettings.defaultLanguage || "ko";
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
    applyLanguage();
    renderStaffOptions();
    updateRoleFields();
    applyQuestSettings();
    renderHistory();
    renderRankings();
    renderAnnouncement();
    renderOperationPoints();
    updateQuestProgress();
    return true;
  } catch (error) {
    console.warn(error);
    renderStaffOptions();
    updateQuestProgress();
    return false;
  }
}

async function ensureCloudStaffReady() {
  if (typeof cloudEnabled !== "function" || !cloudEnabled() || cloudStaffLoaded) return;
  try {
    await cloudSyncPromise;
  } catch (error) {
    console.warn(error);
  }
}

function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Cloud sync timeout")), ms);
    }),
  ]);
}

function renderStaffOptions() {
  const date = els.date.value;
  const selected = els.staffSelect.value;

  if (lockedStaffId) {
    setStaffAccessMode("private");
    const person = lockedStaff();
    if (!person) {
      els.staffSelect.innerHTML = `<option value="">${currentLang === "vi" ? "Vui lòng kiểm tra link cá nhân" : "직원 전용 링크를 확인해주세요"}</option>`;
      els.staffSelect.disabled = true;
      els.employeePhone?.classList.add("is-locked-staff");
      renderLockedStaffCard(undefined, "invalid");
      updateRoleFields();
      updateEmotionFeedback(0);
      return;
    }
    els.staffSelect.innerHTML = `<option value="${person.id}">${escapeHtml(visibleStaffName(person, 0))} · ${roleLabel(person.role)}</option>`;
    els.staffSelect.value = person.id;
    els.staffSelect.disabled = true;
    els.employeePhone?.classList.add("is-locked-staff");
    els.staffSelect.closest("label")?.classList.add("locked-staff-field");
    renderLockedStaffCard(person, "locked");
    const help = els.staffSelect.parentElement?.querySelector(".staff-inline-help");
    if (help) help.textContent = currentLang === "vi"
      ? "Bạn đang dùng link cá nhân. Màn hình này chỉ ghi nhận cho chính bạn."
      : "직원 전용 링크로 접속 중입니다. 이 화면은 본인 기록만 작성할 수 있어요.";
    updateRoleFields();
    return;
  }

  if (!isPreviewMode) {
    setStaffAccessMode("required");
    els.staffSelect.innerHTML = `<option value="">${currentLang === "vi" ? "Vui lòng mở bằng link cá nhân" : "직원 전용 링크로 접속해주세요"}</option>`;
    els.staffSelect.disabled = true;
    els.employeePhone?.classList.add("is-locked-staff", "is-staff-required");
    els.staffSelect.closest("label")?.classList.add("locked-staff-field");
    renderLockedStaffCard(undefined, "required");
    const help = els.staffSelect.parentElement?.querySelector(".staff-inline-help");
    if (help) help.textContent = currentLang === "vi"
      ? "Hãy nhận link cá nhân từ trang quản lý nhân viên."
      : "직원관리 페이지에서 본인 전용 링크를 받아 접속해주세요.";
    updateRoleFields();
    updateEmotionFeedback(0);
    return;
  }

  setStaffAccessMode("preview");
  els.employeePhone?.classList.remove("is-locked-staff", "is-staff-required");
  els.staffSelect.closest("label")?.classList.remove("locked-staff-field");
  renderLockedStaffCard(undefined, "preview");
  const people = activeStaff().filter((person) => !isManagerRole(person.role) && isScheduledWorkDay(person, date));

  if (!people.length) {
    els.staffSelect.innerHTML = `<option value="">${t("noScheduledStaff")}</option>`;
    els.staffSelect.disabled = true;
    updateRoleFields();
    updateEmotionFeedback(0);
    return;
  }

  els.staffSelect.disabled = false;
  els.staffSelect.innerHTML = people.map((person, index) => {
    const name = visibleStaffName(person, index);
    return `<option value="${person.id}">${escapeHtml(name)} · ${roleLabel(person.role)}</option>`;
  }).join("");
  els.staffSelect.value = people.some((person) => person.id === selected) ? selected : people[0].id;
  updateRoleFields();
}

function setStaffAccessMode(mode) {
  document.body.classList.toggle("is-private-staff", mode === "private");
  document.body.classList.toggle("is-staff-required", mode === "required");
  document.body.classList.toggle("is-preview-staff", mode === "preview");
}

function renderLockedStaffCard(person, mode = "locked") {
  if (!els.lockedStaffCard) return;
  const shouldShow = mode !== "preview";
  els.lockedStaffCard.classList.toggle("is-hidden", !shouldShow);
  if (!shouldShow) return;

  if (person) {
    els.lockedStaffEyebrow.textContent = currentLang === "vi" ? "Trang cá nhân" : "내 전용 페이지";
    els.lockedStaffName.textContent = visibleStaffName(person, 0);
    els.lockedStaffRole.textContent = currentLang === "vi"
      ? `${roleLabel(person.role)} · Chỉ ghi nhận cho bạn`
      : `${roleLabel(person.role)} · 오늘 기록은 본인에게만 저장됩니다`;
    return;
  }

  els.lockedStaffEyebrow.textContent = currentLang === "vi" ? "Cần link cá nhân" : "직원 전용 링크 필요";
  els.lockedStaffName.textContent = currentLang === "vi" ? "Không thể chọn nhân viên" : "직원을 선택할 수 없어요";
  els.lockedStaffRole.textContent = currentLang === "vi"
    ? "Hãy mở bằng link cá nhân từ quản lý."
    : "직원관리 페이지에서 발급한 개인 링크로 접속해주세요.";
}

function updateRoleFields() {
  const person = selectedStaff();
  const isHall = isHallRole(person?.role);
  const isKitchen = isKitchenRole(person?.role);
  const isMarketer = isMarketerRole(person?.role);
  els.hallPointBox.classList.toggle("is-hidden", !isHall || !questEnabled("serviceXp"));
  els.kitchenPointBox?.classList.toggle("is-hidden", !isKitchen || !questEnabled("serviceXp"));
  els.marketerPointBox?.classList.toggle("is-hidden", !isMarketer || !questEnabled("serviceXp"));
  els.photoCard?.classList.add("is-hidden");
  els.photoPreview?.classList.add("is-hidden");
  updatePhotoProofCopy();
  if (els.realtimeTitle) {
    els.realtimeTitle.textContent = isMarketer
      ? (currentLang === "vi" ? "Ghi nhận đóng góp marketing" : "실시간 마케팅 기여")
      : isKitchen
      ? (currentLang === "vi" ? "Ghi nhận đóng góp vận hành" : "실시간 운영 기여")
      : t("realtimeTitle");
  }
  if (els.realtimeHelp) {
    els.realtimeHelp.textContent = isMarketer
      ? (currentLang === "vi" ? "Đăng nội dung, kế hoạch và báo cáo thì bấm ghi nhận ngay." : "포스팅, 영상, 기획, 성과 보고가 생기면 바로 기록해요.")
      : isKitchen
      ? (currentLang === "vi" ? "Chọn khu vực đã vệ sinh. App sẽ hiển thị lần vệ sinh gần nhất và XP tương ứng." : "청소한 구역을 고르면 마지막 청소일과 XP가 바로 표시돼요.")
      : t("realtimeHelp");
  }
  updateEmployeeTabLabels();
  updateCloseArea();
  renderPraiseTargetOptions();
  updateQuestCardStates();
}

function relocatePhotoProofCard(isKitchen = isKitchenRole(selectedStaff()?.role)) {
  if (!els.photoCard || !els.photoPreview || !els.kitchenPointBox) return;
  if (isKitchen && els.kitchenPerformanceGrid) {
    els.kitchenPerformanceGrid.insertAdjacentElement("beforebegin", els.photoPreview);
    els.kitchenPerformanceGrid.insertAdjacentElement("beforebegin", els.photoCard);
    return;
  }
  els.kitchenPointBox.insertAdjacentElement("beforebegin", els.photoPreview);
  els.kitchenPointBox.insertAdjacentElement("beforebegin", els.photoCard);
}

function updatePhotoProofCopy() {
  if (!els.photoCard) return;
  const person = selectedStaff();
  const isKitchen = isKitchenRole(person?.role);
  const title = els.photoCard.querySelector("[data-i18n='photoLabel']");
  const help = els.photoCard.querySelector("[data-i18n='photoHelp']");
  if (isKitchen) {
    if (title) title.textContent = currentLang === "vi" ? "Ảnh xác nhận vệ sinh" : "청소 인증 사진";
    if (help) {
      help.textContent = currentLang === "vi"
        ? "Chụp khu vực đã vệ sinh để quản lý kiểm tra khi duyệt."
        : "청소한 구역을 사진으로 올리면 관리자가 승인할 때 바로 확인할 수 있어요.";
    }
  } else {
    if (title) title.textContent = t("photoLabel");
    if (help) help.textContent = t("photoHelp");
  }
  renderPhotoPreview();
}

function renderPraiseTargetOptions(selectedValue = els.helpType?.value || "") {
  if (!els.helpType) return;
  const person = selectedStaff();
  const people = activeStaff().filter((item) => (
    !isManagerRole(item.role) &&
    item.id !== person?.id
  ));
  const placeholder = t("noneOption");
  els.helpType.innerHTML = [
    `<option value="">${escapeHtml(placeholder)}</option>`,
    ...people.map((item, index) => (
      `<option value="${escapeHtml(item.id)}">${escapeHtml(visibleStaffName(item, index))} · ${escapeHtml(roleLabel(item.role))}</option>`
    )),
  ].join("");
  els.helpType.value = people.some((item) => item.id === selectedValue) ? selectedValue : "";
  if (!els.helpType.value) setRealtimeCount(els.helpCount, 0);
  updatePraiseCompleteButton();
}

function updateCloseArea() {
  const person = selectedStaff();
  const label = closeAreaLabel(person?.role);
  if (els.cleanArea) els.cleanArea.value = label;
  if (els.closeAreaText) els.closeAreaText.textContent = `${t("cleanAssigneePrefix")}: ${closeAreaDisplayLabel(label)}`;
}

function closeAreaLabel(role) {
  if (isKitchenRole(role)) return "주방 마감 상태";
  if (isHallRole(role)) return "홀 마감 상태";
  return "내 구역 마감 상태";
}

function closeAreaDisplayLabel(value) {
  const labels = {
    "주방 마감 상태": { ko: "주방 마감 상태", vi: "Khu bếp cuối ca" },
    "홀 마감 상태": { ko: "홀 마감 상태", vi: "Khu phục vụ cuối ca" },
    "내 구역 마감 상태": { ko: "내 구역 마감 상태", vi: "Khu vực của tôi cuối ca" },
  };
  return labels[value]?.[currentLang] || value;
}

function cleanStatusDisplayLabel(value) {
  const labels = {
    "이상 없음": { ko: "이상 없음", vi: t("cleanStatusOk") },
    "정리 완료": { ko: "부족한 부분 정리 완료", vi: t("cleanStatusFixed") },
    "매니저 확인 필요": { ko: "매니저 확인 필요", vi: t("cleanStatusManager") },
  };
  return labels[value]?.[currentLang] || value;
}

function applyQuestSettings() {
  Object.entries(els.questCards).forEach(([key, card]) => {
    if (card) card.classList.toggle("is-hidden", !questEnabled(key));
  });
  updateRoleFields();
}

function handleAttendanceToggle() {
  if (els.attendance.checked && !checkinMood) {
    els.attendance.checked = false;
    guideMoodBeforeCheckin();
    return;
  }
  const currentKey = draftKey();
  const hadAttendanceTime = Boolean(attendanceTime);
  if (els.attendance.checked && !attendanceTime) {
    attendanceTime = formatClockTime(new Date());
  }
  if (!els.attendance.checked) {
    attendanceTime = "";
  }
  renderAttendanceTime();
  window.requestAnimationFrame(renderAttendanceTime);
  if (els.attendance.checked && !hadAttendanceTime && attendancePraiseKey !== currentKey) {
    attendancePraiseKey = currentKey;
    showHatiPraise("attendance");
    trackEmployeeEvent("employee_checkin", {
      attendanceTime,
      dedupeKey: `${els.date.value}:${selectedStaff()?.id || ""}:employee_checkin`,
    });
    trackTaskCompleted("attendance", { attendanceTime });
  }
  updateQuestProgress();
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
  updateSpecialCleanLastStatus();
}

function handleGoalToggle() {
  if (els.goal?.checked) praiseOnce("goal");
  if (els.goal?.checked) trackTaskCompleted("goal");
  updateQuestProgress();
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
  updateSpecialCleanLastStatus();
}

function completeCheckoutGuard(options = {}) {
  const { skipAutosave = false, quiet = false } = options;
  const wasDone = cleaningQuestDone();
  updateCloseArea();
  if (els.cleanStatus) els.cleanStatus.value = "이상 없음";
  if (els.cleaning) els.cleaning.checked = true;
  if (!wasDone && !quiet) praiseOnce("cleaning");
  if (!wasDone && !skipAutosave) trackTaskCompleted("checkout_guard");
  updateQuestProgress();
  if (!skipAutosave) {
    saveDraft({ showMessage: false });
    saveLiveSelfCheck();
  }
  if (!quiet) {
    setDraftStatus(currentLang === "vi"
      ? "Đã xong kiểm tra cuối ca. Bấm nút gửi kết ca bên dưới để gửi cho quản lý."
      : "마감 가드 완료. 아래 퇴근 제출 버튼을 눌러 매니저에게 보내주세요.");
  }
}

function focusCheckoutSubmitButton() {
  const button = firstVisibleElement([
    els.employeeTabContent?.querySelector("[data-submit-checkout]:not(:disabled)"),
    document.querySelector(".submit-self-check:not(:disabled)"),
  ]);
  if (!button) return;
  window.setTimeout(() => {
    button.scrollIntoView({ behavior: "smooth", block: "center" });
    button.classList.add("is-attention");
    window.setTimeout(() => button.classList.remove("is-attention"), 1300);
  }, 80);
}

function firstVisibleElement(nodes) {
  return nodes.find((node) => {
    if (!node) return false;
    const rect = node.getBoundingClientRect();
    const style = window.getComputedStyle(node);
    return rect.width > 0 && rect.height > 0 && style.display !== "none" && style.visibility !== "hidden";
  });
}

function completeAttendanceCheckin() {
  if (!els.attendance || els.attendance.checked) return;
  els.attendance.checked = true;
  handleAttendanceToggle();
  setEmployeeTab("checkin", { scroll: false });
}

function handleCheckinPageAction() {
  if (!els.attendance?.checked) {
    if (!checkinMood) {
      pendingCheckinAfterMood = true;
      guideMoodBeforeCheckin();
      return;
    }
    completeAttendanceCheckin();
    return;
  }
  if (els.goal && !els.goal.checked) {
    markGoalConfirmed();
  }
}

function guideMoodBeforeCheckin() {
  setEmployeeTab("checkin", { scroll: true });
  setDraftStatus(currentLang === "vi" ? "Hãy chọn tâm trạng trước khi chấm công." : "출근 체크 전에 오늘 기분을 먼저 선택해주세요.");
  window.setTimeout(() => {
    const card = els.employeeTabContent?.querySelector(".checkin-mood-card");
    card?.classList.add("needs-attention");
    card?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => card?.classList.remove("needs-attention"), 1800);
  }, 80);
}

function focusCheckinActionButton() {
  const button = firstVisibleElement([
    els.employeeTabContent?.querySelector("[data-checkin-action]:not(:disabled)"),
  ]);
  if (!button) return;
  window.setTimeout(() => {
    button.scrollIntoView({ behavior: "smooth", block: "center" });
    button.classList.add("is-attention");
    window.setTimeout(() => button.classList.remove("is-attention"), 1300);
  }, 120);
}

function markGoalConfirmed() {
  if (!els.goal) return;
  const wasChecked = els.goal.checked;
  els.goal.checked = true;
  handleGoalToggle();
  setEmployeeTab("checkin", { scroll: false });
  setDraftStatus(currentLang === "vi" ? "Đã xác nhận mục tiêu hôm nay." : "오늘 목표맵 확인 완료!");
  if (!wasChecked) showHatiPraise("goal");
}

function handleCheckinMoodSelect(value) {
  checkinMood = value;
  showCheckinMoodToast();
  if (pendingCheckinAfterMood && !els.attendance?.checked) {
    pendingCheckinAfterMood = false;
    updateQuestProgress();
    saveDraft({ showMessage: false });
    saveLiveSelfCheck();
    setEmployeeTab("checkin", { scroll: false });
    setDraftStatus(employeeCopy().moodReady);
    focusCheckinActionButton();
    return;
  }
  pendingCheckinAfterMood = false;
  updateQuestProgress();
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
  setEmployeeTab("checkin", { scroll: false });
  setDraftStatus(employeeCopy().moodReady);
  focusCheckinActionButton();
}

function handleHelpChange() {
  praiseSkipped = false;
  const canComplete = Boolean(els.helpType?.value && els.helpReason?.value);
  setRealtimeCount(els.helpCount, 0);
  if (!els.helpType?.value && els.helpReason) els.helpReason.value = "";
  updatePraiseCompleteButton(canComplete);
  updateQuestProgress();
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
}

function completePraise() {
  if (!els.helpType?.value || !els.helpReason?.value) {
    setDraftStatus(currentLang === "vi" ? "Hãy chọn đồng đội và lý do khen." : "칭찬할 직원과 이유를 먼저 선택해주세요.");
    return;
  }
  praiseSkipped = false;
  setRealtimeCount(els.helpCount, 1);
  if (els.praiseCompleteButton) {
    els.praiseCompleteButton.disabled = true;
    els.praiseCompleteButton.textContent = currentLang === "vi" ? "Đã gửi ✓" : "칭찬 완료 ✓";
  }
  praiseOnce("help");
  trackTaskCompleted("praise");
  updateQuestProgress();
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
}

function skipPraise() {
  praiseSkipped = true;
  if (els.helpType) els.helpType.value = "";
  if (els.helpReason) els.helpReason.value = "";
  if (els.helpNote) els.helpNote.value = "";
  setRealtimeCount(els.helpCount, 0);
  updatePraiseCompleteButton(false);
  setDraftStatus(currentLang === "vi" ? "Hôm nay không có lời khen." : "오늘은 칭찬할 사람 없음으로 체크했어요.");
  updateQuestProgress();
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
}

function updatePraiseCompleteButton(canComplete = Boolean(els.helpType?.value && els.helpReason?.value)) {
  const isComplete = readRealtimeCount(els.helpCount) > 0;
  if (els.praiseCompleteButton) {
    els.praiseCompleteButton.disabled = praiseSkipped || isComplete || !canComplete;
    els.praiseCompleteButton.textContent = isComplete
      ? (currentLang === "vi" ? "Đã gửi ✓" : "칭찬 완료 ✓")
      : (currentLang === "vi" ? "Gửi lời khen" : "칭찬 완료");
  }
  if (els.praiseSkipButton) {
    els.praiseSkipButton.disabled = praiseSkipped || isComplete;
    els.praiseSkipButton.textContent = praiseSkipped
      ? (currentLang === "vi" ? "Không khen hôm nay ✓" : "칭찬할 사람 없음 ✓")
      : (currentLang === "vi" ? "Hôm nay không khen ai" : "오늘은 칭찬할 사람 없음");
  }
}

function cleaningQuestDone() {
  return Boolean(els.cleaning?.checked && els.cleanArea?.value);
}

function renderCheckoutTime() {
  if (!els.checkoutTimeText) return;
  els.checkoutTimeText.textContent = checkoutTime
    ? `${checkoutTime} ${t("checkoutRecorded")}`
    : t("checkoutPending");
  els.checkoutTimeText.classList.toggle("is-checked", Boolean(checkoutTime));
}

function renderAttendanceTime() {
  if (!els.attendanceTimeText) return;
  els.attendanceTimeText.textContent = attendanceTime
    ? `${attendanceTime} ${t("attendanceDone")}`
    : t("attendancePending");
  els.attendanceTimeText.classList.toggle("is-checked", Boolean(attendanceTime));
}

async function readPhoto() {
  const files = [...(els.photoInput.files || [])];
  if (!files.length) {
    updateQuestProgress();
    return;
  }

  try {
    const nextPhotos = await Promise.all(files.map(readPhotoFile));
    const previousCount = photos.length;
    photos = mergeReviewPhotos(photos, nextPhotos);
    els.photoInput.value = "";
    renderPhotoPreview();
    if (photos.length > previousCount) showHatiPraise("photo");
    updateQuestProgress();
    saveDraft({ showMessage: false });
    await saveLiveSelfCheck();
  } catch (error) {
    console.warn(error);
    alert(currentLang === "vi" ? "Không lưu được ảnh. Vui lòng thử lại." : "사진을 저장하지 못했어요. 다시 시도해주세요.");
  }
}

function readPhotoFile(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      const rawDataUrl = String(reader.result || "");
      const dataUrl = await compressImageDataUrl(rawDataUrl, 640, 0.68).catch(() => rawDataUrl);
      resolve({
        name: file.name,
        size: dataUrl.length,
        originalSize: file.size,
        lastModified: file.lastModified,
        dataUrl,
      });
    });
    reader.addEventListener("error", () => {
      resolve({
        name: file.name,
        size: file.size,
        originalSize: file.size,
        lastModified: file.lastModified,
        dataUrl: "",
      });
    });
    reader.readAsDataURL(file);
  });
}

function compressImageDataUrl(dataUrl, maxSize = 960, quality = 0.72) {
  if (!dataUrl.startsWith("data:image/")) return Promise.resolve(dataUrl);
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => {
      const ratio = Math.min(1, maxSize / Math.max(image.width, image.height));
      if (!ratio || ratio >= 1) {
        resolve(dataUrl);
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const context = canvas.getContext("2d");
      if (!context) {
        resolve(dataUrl);
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", quality));
    });
    image.addEventListener("error", reject);
    image.src = dataUrl;
  });
}

function readProfilePhotoFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      const rawDataUrl = String(reader.result || "");
      const dataUrl = await compressImageDataUrl(rawDataUrl, 520, 0.76).catch(() => rawDataUrl);
      resolve(dataUrl);
    });
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

async function handleProfilePhotoChange(event) {
  const input = event.target.closest("[data-profile-photo-input]");
  if (!input) return;
  const file = input.files?.[0];
  input.value = "";
  if (!file) return;
  if (!String(file.type || "").startsWith("image/")) {
    alert(currentLang === "vi" ? "Vui lòng chọn file ảnh." : "이미지 파일을 선택해주세요.");
    return;
  }
  const staffId = input.dataset.profileStaffId || selectedStaff()?.id;
  if (!staffId) return;
  try {
    const dataUrl = await readProfilePhotoFile(file);
    const savePromise = saveProfilePhoto(staffId, dataUrl);
    showHatiPraise("photo");
    setEmployeeTab("my", { scroll: false });
    savePromise.catch((error) => {
      console.warn(error);
      showHatiPraise("photo");
    });
  } catch (error) {
    console.warn(error);
    alert(currentLang === "vi" ? "Không lưu được ảnh. Vui lòng thử lại." : "사진을 저장하지 못했어요. 다시 시도해주세요.");
  }
}

async function saveProfilePhoto(staffId, dataUrl) {
  const updatedAt = new Date().toISOString();
  const updateStaff = (items = []) => items.map((person) => (
    person.id === staffId
      ? { ...person, profilePhotoDataUrl: dataUrl, profilePhotoUpdatedAt: updatedAt }
      : person
  ));
  staff = updateStaff(staff);
  state.staff = updateStaff(state.staff || staff);
  try {
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
  } catch (error) {
    console.warn("Profile photo local cache skipped", error);
  }
  renderStaffOptions();
  updateQuestProgress();
  if (typeof cloudEnabled !== "function" || !cloudEnabled()) {
    return;
  }
  const cloudState = await withTimeout(loadStateFromCloud(), cloudReadTimeoutMs).catch(() => null);
  const nextCloudState = {
    ...state,
    ...(cloudState || {}),
    staff: updateStaff(normalizeStaff(cloudState?.staff || state.staff)),
  };
  try {
    localStorage.setItem(appStorageKey(), JSON.stringify(nextCloudState));
  } catch (error) {
    console.warn("Profile photo cloud cache skipped", error);
  }
  state = {
    ...nextCloudState,
    storeSettings: normalizeStoreSettings(nextCloudState.storeSettings),
    selfChecks: nextCloudState.selfChecks || [],
    announcements: Array.isArray(nextCloudState.announcements) ? nextCloudState.announcements : (state.announcements || []),
  };
  staff = normalizeStaff(state.staff);
  await saveStateToCloud(state);
  renderStaffOptions();
  updateQuestProgress();
}

function profilePhotoDataUrl(person) {
  const value = String(
    person?.profilePhotoDataUrl ||
    person?.profilePhotoDataURL ||
    person?.profilePhoto ||
    person?.photoDataUrl ||
    person?.photoDataURL ||
    ""
  );
  return value.startsWith("data:image/") ? value : "";
}

function mergeReviewPhotos(existingPhotos, nextPhotos) {
  const merged = [...(Array.isArray(existingPhotos) ? existingPhotos : [])];
  nextPhotos.forEach((photo) => {
    const duplicate = merged.some((item) => (
      item?.dataUrl === photo.dataUrl ||
      (item?.name === photo.name && item?.size === photo.size && item?.lastModified === photo.lastModified)
    ));
    if (!duplicate) merged.push(photo);
  });
  return merged;
}

function handlePhotoPreviewClick(event) {
  const button = event.target.closest("[data-delete-photo]");
  if (!button) return;
  const index = Number(button.dataset.deletePhoto);
  if (!Number.isInteger(index) || index < 0 || index >= photos.length) return;
  photos = photos.filter((_, photoIndex) => photoIndex !== index);
  renderPhotoPreview();
  updateQuestProgress();
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
}

function draftKey(date = els.date.value, staffId = els.staffSelect.value) {
  return `${date || "no-date"}::${staffId || "no-staff"}`;
}

function loadDrafts() {
  try {
    return JSON.parse(localStorage.getItem(draftStorageKey)) || {};
  } catch {
    return {};
  }
}

function writeDrafts(drafts) {
  localStorage.setItem(draftStorageKey, JSON.stringify(drafts));
}

function draftPayload() {
  const helpCount = readRealtimeCount(els.helpCount);
  const hasHelpRecord = helpCount > 0;
  const reviewCount = readRealtimeCount(els.reviewPoint);
  const performanceReports = performanceReportPayload();
  const legacy = legacyPerformanceFromReports(performanceReports);
  return {
    attendance: Boolean(els.attendance.checked),
    attendanceTime,
    checkoutTime,
    checkinMood,
    cleaningDone: Boolean(els.cleaning.checked),
    cleanArea: els.cleanArea?.value || "",
    cleanStatus: els.cleanStatus?.value || "",
    goalChecked: Boolean(els.goal.checked),
    goalType: els.goal.checked ? operationPointSummary() : "",
    helpSkipped: praiseSkipped,
    helpCount,
    helpType: hasHelpRecord ? (els.helpType.value || t("helpLabel")) : "",
    helpReason: hasHelpRecord ? (els.helpReason?.value || "") : "",
    helpNote: hasHelpRecord ? (els.helpNote?.value.trim() || "") : "",
    photos,
    performanceReports,
    reviewPoint: reviewCount,
    upsellPoint: legacy.upsellPoint,
    membershipPoint: legacy.membershipPoint,
    recommendedMenuPoint: legacy.recommendedMenuPoint,
    hygieneFixPoint: legacy.hygieneFixPoint,
    threadPostPoint: legacy.threadPostPoint,
    videoPostPoint: legacy.videoPostPoint,
    tomorrowPlanPoint: legacy.tomorrowPlanPoint,
    marketingReportPoint: legacy.marketingReportPoint,
    specialCleanArea: legacy.specialCleanArea,
    specialCleanXp: legacy.specialCleanXp,
    note: els.note.value.trim(),
    savedAt: new Date().toISOString(),
  };
}

function saveDraft({ showMessage = false } = {}) {
  const person = selectedStaff();
  if (!person || !els.date.value) return;
  const drafts = loadDrafts();
  drafts[draftKey()] = draftPayload();
  writeDrafts(drafts);
  if (els.draftStatus) {
    els.draftStatus.textContent = showMessage
      ? t("draftSavedStatus")
      : t("draftLiveStatus");
  }
}

function setDraftStatus(message) {
  if (els.draftStatus) els.draftStatus.textContent = message;
}

async function saveLiveSelfCheck() {
  const person = selectedStaff();
  if (!person || !els.date.value) return;
  const draft = draftPayload();
  const hasRealtimeRecord = Boolean(
    draft.attendance ||
    draft.checkinMood ||
    draft.goalChecked ||
    draft.helpSkipped ||
    draft.helpType ||
    draft.reviewPoint ||
    draft.upsellPoint ||
    draft.membershipPoint ||
    draft.recommendedMenuPoint ||
    draft.hygieneFixPoint ||
    draft.threadPostPoint ||
    draft.videoPostPoint ||
    draft.tomorrowPlanPoint ||
    draft.marketingReportPoint ||
    draft.photos.length
  );
  if (!hasRealtimeRecord) return;

  const existingFinal = (state.selfChecks || []).find((entry) => (
    entry.date === els.date.value &&
    entry.staffId === person.id &&
    ["pending", "approved"].includes(entry.status)
  ));
  if (existingFinal) return;

  const existingLive = (state.selfChecks || []).find((entry) => (
    entry.date === els.date.value &&
    entry.staffId === person.id &&
    entry.status === "live"
  ));
  const liveEntry = {
    ...(existingLive || {}),
    id: existingLive?.id || uniqueId(),
    date: els.date.value,
    staffId: person.id,
    staffName: visibleStaffName(person, 0),
    role: person.role,
    roleName: roleLabel(person.role),
    attendance: questEnabled("attendance") ? (draft.attendance ? 1 : 0) : 1,
    attendanceTime: draft.attendanceTime,
    checkinMood: draft.checkinMood || "",
    checkoutTime: "",
    cleaningDone: false,
    cleanArea: "",
    cleanStatus: "",
    goalChecked: questEnabled("goal") && draft.goalChecked,
    goalType: questEnabled("goal") && draft.goalChecked ? draft.goalType : "",
    helpSkipped: questEnabled("help") && draft.helpSkipped,
    helpCount: questEnabled("help") && draft.helpType ? 1 : 0,
    helpType: questEnabled("help") ? draft.helpType : "",
    helpReason: questEnabled("help") ? draft.helpReason : "",
    helpNote: questEnabled("help") ? draft.helpNote : "",
    photos: questEnabled("photo") ? draft.photos : [],
    photoName: questEnabled("photo") ? (draft.photos[0]?.name || "") : "",
    photoDataUrl: questEnabled("photo") ? (draft.photos[0]?.dataUrl || "") : "",
    performanceReports: questEnabled("serviceXp") ? (draft.performanceReports || []).filter((report) => (
      (isHallRole(person.role) && report.role === "hall") ||
      (isKitchenRole(person.role) && report.role === "kitchen") ||
      (isMarketerRole(person.role) && report.role === "marketer")
    )) : [],
    upsellPoint: questEnabled("serviceXp") && isHallRole(person.role) ? draft.upsellPoint : 0,
    membershipPoint: questEnabled("serviceXp") && isHallRole(person.role) ? draft.membershipPoint : 0,
    reviewPoint: questEnabled("serviceXp") && isHallRole(person.role) ? draft.reviewPoint : 0,
    recommendedMenuPoint: questEnabled("serviceXp") && isHallRole(person.role) ? draft.recommendedMenuPoint : 0,
    hygieneFixPoint: questEnabled("serviceXp") && isKitchenRole(person.role) ? draft.hygieneFixPoint : 0,
    specialCleanArea: questEnabled("serviceXp") && isKitchenRole(person.role) ? draft.specialCleanArea : "",
    specialCleanXp: questEnabled("serviceXp") && isKitchenRole(person.role) ? draft.specialCleanXp : 0,
    threadPostPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? draft.threadPostPoint : 0,
    videoPostPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? draft.videoPostPoint : 0,
    tomorrowPlanPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? draft.tomorrowPlanPoint : 0,
    marketingReportPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? draft.marketingReportPoint : 0,
    note: draft.note,
    status: "live",
    createdAt: existingLive?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingLive) {
    Object.assign(existingLive, liveEntry);
  } else {
    state.selfChecks = [...(state.selfChecks || []), liveEntry];
  }
  await saveState();
  renderHistory();
}

function clearDraft(date = els.date.value, staffId = els.staffSelect.value) {
  const drafts = loadDrafts();
  delete drafts[draftKey(date, staffId)];
  writeDrafts(drafts);
}

function restoreDraft() {
  const person = selectedStaff();
  if (!person || !els.date.value) {
    checkoutTime = "";
    attendancePraiseKey = "";
    clearDraftFormValues();
    renderCheckoutTime();
    if (els.draftStatus) els.draftStatus.textContent = t("draftSelectStaffStatus");
    return;
  }
  if (isFreshTestMode) {
    checkoutTime = "";
    attendancePraiseKey = "";
    clearDraftFormValues();
    renderCheckoutTime();
    if (els.draftStatus) els.draftStatus.textContent = currentLang === "vi" ? "Chế độ test mới: bắt đầu lại từ đầu." : "새 테스트 모드: 처음 상태로 다시 시작합니다.";
    updateQuestProgress();
    return;
  }
  const draft = loadDrafts()[draftKey()];
  if (!draft) {
    checkoutTime = "";
    attendancePraiseKey = "";
    clearDraftFormValues();
    renderCheckoutTime();
    if (els.draftStatus) els.draftStatus.textContent = t("draftReadyStatus");
    return;
  }

  els.attendance.checked = Boolean(draft.attendance);
  attendanceTime = draft.attendanceTime || (els.attendance.checked ? formatClockTime(new Date()) : "");
  attendancePraiseKey = attendanceTime ? draftKey() : "";
  checkoutTime = draft.checkoutTime || "";
  checkinMood = draft.checkinMood || "";
  els.cleaning.checked = Boolean(draft.cleaningDone);
  updateCloseArea();
  if (els.cleanStatus) els.cleanStatus.value = draft.cleanStatus || "";
  els.goal.checked = Boolean(draft.goalChecked);
  praiseSkipped = Boolean(draft.helpSkipped);
  renderPraiseTargetOptions(draft.helpType || "");
  els.helpType.value = draft.helpType || "";
  setRealtimeCount(els.helpCount, Number(draft.helpCount || (draft.helpType ? 1 : 0)));
  if (els.helpReason) els.helpReason.value = draft.helpReason || "";
  if (els.helpNote) els.helpNote.value = draft.helpNote || "";
  updatePraiseCompleteButton();
  setRealtimeCount(els.reviewPoint, Number(draft.reviewPoint || 0));
  setRealtimeCount(els.upsellPoint, Number(draft.upsellPoint || 0));
  setRealtimeCount(els.membershipPoint, Number(draft.membershipPoint || 0));
  setRealtimeCount(els.recommendedMenuPoint, Number(draft.recommendedMenuPoint || 0));
  setRealtimeCount(els.threadPostPoint, Number(draft.threadPostPoint || 0));
  setRealtimeCount(els.videoPostPoint, Number(draft.videoPostPoint || 0));
  setRealtimeCount(els.tomorrowPlanPoint, Number(draft.tomorrowPlanPoint || 0));
  setRealtimeCount(els.marketingReportPoint, Number(draft.marketingReportPoint || 0));
  setPerformanceReportCounts(draft);
  renderSpecialCleanOptions(draft.specialCleanArea || "");
  setRealtimeCount(els.hygieneFixPoint, Number(draft.hygieneFixPoint || 0));
  updateSpecialCleanXpLabel();
  els.note.value = draft.note || "";
  photos = Array.isArray(draft.photos) ? draft.photos : [];
  renderAttendanceTime();
  renderCheckoutTime();
  renderPhotoPreview();
  if (els.draftStatus) els.draftStatus.textContent = t("draftRestoredStatus");
  updateQuestProgress();
}

function clearDraftFormValues() {
  els.attendance.checked = false;
  attendanceTime = "";
  attendancePraiseKey = "";
  checkinMood = "";
  els.cleaning.checked = false;
  updateCloseArea();
  if (els.cleanStatus) els.cleanStatus.value = "";
  els.goal.checked = false;
  praiseSkipped = false;
  setRealtimeCount(els.helpCount, 0);
  if (els.helpType) els.helpType.value = "";
  if (els.helpReason) els.helpReason.value = "";
  if (els.helpNote) els.helpNote.value = "";
  setRealtimeCount(els.reviewPoint, 0);
  setRealtimeCount(els.upsellPoint, 0);
  setRealtimeCount(els.membershipPoint, 0);
  setRealtimeCount(els.recommendedMenuPoint, 0);
  setRealtimeCount(els.threadPostPoint, 0);
  setRealtimeCount(els.videoPostPoint, 0);
  setRealtimeCount(els.tomorrowPlanPoint, 0);
  setRealtimeCount(els.marketingReportPoint, 0);
  clearPerformanceCounts();
  if (els.specialCleanArea) els.specialCleanArea.value = "";
  setRealtimeCount(els.hygieneFixPoint, 0);
  updateSpecialCleanXpLabel();
  updateSpecialCleanLastStatus();
  if (els.note) els.note.value = "";
  photos = [];
  renderAttendanceTime();
  renderPhotoPreview();
}

function renderPhotoPreview() {
  const isKitchen = isKitchenRole(selectedStaff()?.role);
  els.photoPreview.innerHTML = photos.map((photo, index) => (
    `<figure class="photo-preview-item">
      <img class="photo-preview" src="${photo.dataUrl}" alt="${escapeHtml(photo.name)}" />
      <button type="button" data-delete-photo="${index}" aria-label="${currentLang === "vi" ? "Xóa ảnh" : "사진 삭제"}">×</button>
    </figure>`
  )).join("");
  els.photoPreview.classList.toggle("is-hidden", !photos.length);
  if (els.reviewUploadStatus) {
    els.reviewUploadStatus.textContent = photos.length
      ? (isKitchen
        ? (currentLang === "vi" ? `Đã lưu ${photos.length} ảnh vệ sinh` : `청소 인증 사진 ${photos.length}장 저장됨`)
        : t("reviewPhotoSavedStatus").replace("{count}", photos.length))
      : (isKitchen
        ? (currentLang === "vi" ? "Hãy chọn ảnh khu vực đã vệ sinh." : "청소한 구역 사진을 선택하세요.")
        : t("reviewPhotoEmptyStatus"));
    els.reviewUploadStatus.classList.toggle("is-uploaded", photos.length > 0);
  }
}

function handleRealtimeAdjust(event) {
  const button = event.target.closest("[data-realtime-adjust]");
  if (!button) return;
  const input = document.getElementById(button.dataset.realtimeAdjust);
  if (!input) return;
  const delta = Number(button.dataset.delta || 0);
  const before = readRealtimeCount(input);
  const item = performanceItemById(button.dataset.realtimeAdjust);
  if (["hall", "kitchen", "marketer"].includes(input.dataset.performanceRole) || ["hall", "kitchen", "marketer"].includes(item?.role)) {
    if (delta < 0) {
      setRealtimeCount(input, 0);
    } else {
      setRealtimeCount(input, 1);
    }
  } else {
    const after = clamp(before + delta, 0, 99);
    setRealtimeCount(input, after);
  }
  syncLegacyPerformanceFields();
  updateSpecialCleanLastStatus();
  const after = readRealtimeCount(input);
  if (delta > 0 && after > before) {
    showHatiPraise(button.dataset.realtimeAdjust);
    trackTaskCompleted(button.dataset.realtimeAdjust, { taskName: performanceItemLabel(item) });
  }
  updateQuestProgress();
  if (els.employeePhone?.getAttribute("data-active-tab") === "performance") {
    renderEmployeeTabPanel("performance");
    window.requestAnimationFrame(() => renderEmployeeTabPanel("performance"));
  }
  saveDraft({ showMessage: false });
  saveLiveSelfCheck();
}

function praiseXpValue(type) {
  const values = {
    checkinMood: 0,
    attendance: 10,
    goal: 10,
    cleaning: 10,
    help: 10,
    photo: 10,
    checkout: 10,
    reviewPoint: 10,
    upsellPoint: 10,
    membershipPoint: 10,
    recommendedMenuPoint: 10,
    hygieneFixPoint: selectedSpecialCleanXp() || 10,
    threadPostPoint: 10,
    videoPostPoint: 10,
    tomorrowPlanPoint: 10,
    marketingReportPoint: 10,
  };
  return values[type] || 10;
}

function showXpBurst(type) {
  if (!els.xpBurst) return;
  const xp = praiseXpValue(type);
  if (xp <= 0) {
    window.clearTimeout(showXpBurst.timer);
    els.xpBurst.classList.remove("is-visible");
    return;
  }
  els.xpBurst.textContent = `+${xp} XP`;
  els.xpBurst.classList.remove("is-visible");
  void els.xpBurst.offsetWidth;
  els.xpBurst.classList.add("is-visible");
  window.clearTimeout(showXpBurst.timer);
  showXpBurst.timer = window.setTimeout(() => {
    els.xpBurst?.classList.remove("is-visible");
  }, 900);
}

function hideXpBurst() {
  if (!els.xpBurst) return;
  window.clearTimeout(showXpBurst.timer);
  els.xpBurst.classList.remove("is-visible");
}

function showLevelUpPraise(level) {
  if (!els.hatiToast) return;
  els.hatiToastTitle.textContent = t("levelUpTitle");
  els.hatiToastMessage.textContent = `Lv. ${level} · ${t("levelUpText")}`;
  els.hatiToast.dataset.hatiToastMood = "levelup";
  els.hatiToast.classList.remove("is-visible");
  window.clearTimeout(showHatiPraise.timer);
  requestAnimationFrame(() => els.hatiToast.classList.add("is-visible"));
  showHatiPraise.timer = window.setTimeout(() => {
    els.hatiToast?.classList.remove("is-visible");
  }, 3600);
  if (els.xpBurst) {
    els.xpBurst.textContent = `Lv. ${level}!`;
    els.xpBurst.classList.remove("is-visible");
    void els.xpBurst.offsetWidth;
    els.xpBurst.classList.add("is-visible");
    window.clearTimeout(showXpBurst.timer);
    showXpBurst.timer = window.setTimeout(() => {
      els.xpBurst?.classList.remove("is-visible");
    }, 1200);
  }
  if (window.navigator?.vibrate) window.navigator.vibrate([20, 20, 20]);
  popHati();
}

function showHatiPraise(type) {
  const messages = currentLang === "vi"
    ? {
        attendance: ["Chấm công xong!", "Cảm ơn bạn đã đến hôm nay. HATI nhận thêm năng lượng rồi."],
        checkinMood: ["Đã lưu tâm trạng!", "HATI sẽ cổ vũ theo cảm xúc hôm nay của bạn."],
        goal: ["Đã xem mục tiêu!", "Tốt lắm. HATI biết hôm nay cần tập trung vào điều gì."],
        cleaning: ["Kiểm tra cuối ca xong!", "Rất ổn. Khu vực đã được ghi nhận trước khi về."],
        help: ["Đã ghi lời khen!", "HATI thích tinh thần biết cảm ơn đồng đội này lắm."],
        photo: ["Đã lưu ảnh xác nhận!", "Ảnh đã được lưu tạm. Số lượng thành tích hãy ghi bằng nút riêng."],
        checkout: ["Đã ghi giờ tan ca!", "Hôm nay bạn vất vả rồi. HATI đã lưu ngày làm của bạn."],
        reviewPoint: ["Nhiệm vụ review hoàn thành!", "Tốt lắm. +10 XP đã được lưu cho hôm nay."],
        upsellPoint: ["Nhiệm vụ upsell hoàn thành!", "Hay lắm. +10 XP đã được lưu cho hôm nay."],
        membershipPoint: ["Nhiệm vụ membership hoàn thành!", "Rất tốt. +10 XP đã được lưu cho hôm nay."],
        recommendedMenuPoint: ["Nhiệm vụ món đề xuất hoàn thành!", "Tuyệt vời. +10 XP đã được lưu cho hôm nay."],
        hygieneFixPoint: ["Đã ghi vệ sinh đặc biệt!", "Tốt lắm. Khu vực ít ai để ý cũng được chăm sóc rồi."],
        threadPostPoint: ["Đã ghi bài Threads!", "Tốt lắm. HATI đã lưu đóng góp nội dung của bạn."],
        videoPostPoint: ["Đã ghi video!", "Hay lắm. Nội dung video giúp cửa hàng nổi bật hơn."],
        tomorrowPlanPoint: ["Đã ghi kế hoạch ngày mai!", "Rất tốt. Chuẩn bị trước giúp marketing mạnh hơn."],
        marketingReportPoint: ["Đã ghi báo cáo marketing!", "Tuyệt vời. Kết quả hôm nay đã được lưu rõ ràng."],
      }
    : {
        attendance: ["출근 완료!", "오늘도 와줘서 고마워요. 하티가 에너지를 받았어요."],
        checkinMood: ["오늘 컨디션 저장!", "하티가 오늘 기분에 맞춰 응원할게요."],
        goal: ["목표 확인 완료!", "좋아요. 하티가 오늘 집중할 일을 기억했어요."],
        cleaning: ["퇴근 전 점검 완료!", "깔끔해요. 마감 상태가 안전하게 기록됐어요."],
        help: ["동료 칭찬 기록 완료!", "멋져요. 하티가 팀워크 에너지를 받았어요."],
        photo: ["인증 사진 저장 완료!", "좋아요. 사진은 임시 저장됐고, 성과 횟수는 각 버튼으로 따로 기록해요."],
        checkout: ["퇴근 기록 완료!", "오늘도 수고했어요. 하티가 하루 기록을 안전하게 저장했어요."],
        reviewPoint: ["리뷰 미션 완료!", "+10 XP 저장 완료. 하티가 고객 미소 배지를 받았어요."],
        upsellPoint: ["업셀 미션 완료!", "+10 XP 저장 완료. 추천 성공 배지를 얻었어요."],
        membershipPoint: ["멤버십 미션 완료!", "+10 XP 저장 완료. 단골 연결 배지를 얻었어요."],
        recommendedMenuPoint: ["추천메뉴 미션 완료!", "+10 XP 저장 완료. 오늘 목표 메뉴 배지를 얻었어요."],
        hygieneFixPoint: ["특수 청소 기록 완료!", "좋아요. 평소 손이 덜 가는 구역까지 챙겨서 주방이 더 안정적이에요."],
        threadPostPoint: ["쓰레드 포스팅 기록 완료!", "좋아요. 하티가 콘텐츠 에너지를 받았어요."],
        videoPostPoint: ["영상 촬영/포스팅 기록 완료!", "멋져요. 매장 매력이 더 잘 보이게 됐어요."],
        tomorrowPlanPoint: ["내일 마케팅 기획 완료!", "좋아요. 내일 움직임을 미리 준비했어요."],
        marketingReportPoint: ["마케팅 성과 보고 완료!", "최고예요. 오늘 결과가 깔끔하게 기록됐어요."],
      };
  const [title, message] = messages[type] || (currentLang === "vi"
    ? ["Đã ghi nhận!", "Tốt lắm. HATI đang lớn lên cùng bạn."]
    : ["기록 완료!", "좋아요. 오늘도 하티가 성장하고 있어요."]);
  if (!els.hatiToast) {
    if (els.draftStatus) els.draftStatus.textContent = `${title} ${message}`;
    return;
  }
  const toastMoodByType = {
    attendance: "happy",
    checkinMood: "happy",
    goal: "idle",
    cleaning: "clean",
    help: "happy",
    photo: "success",
    checkout: "sleepy",
    reviewPoint: "success",
    upsellPoint: "success",
    membershipPoint: "success",
    recommendedMenuPoint: "success",
    hygieneFixPoint: "clean",
    threadPostPoint: "success",
    videoPostPoint: "success",
    tomorrowPlanPoint: "idle",
    marketingReportPoint: "success",
  };
  els.hatiToastTitle.textContent = title;
  els.hatiToastMessage.textContent = message;
  els.hatiToast.dataset.hatiToastMood = toastMoodByType[type] || "happy";
  els.hatiToast.classList.remove("is-visible");
  window.clearTimeout(showHatiPraise.timer);
  requestAnimationFrame(() => els.hatiToast.classList.add("is-visible"));
  showHatiPraise.timer = window.setTimeout(() => {
    els.hatiToast.classList.remove("is-visible");
  }, 2600);
  if (window.navigator?.vibrate) window.navigator.vibrate(12);
  showXpBurst(type);
  popHati();
}

function showCheckinMoodToast() {
  hideXpBurst();
  const title = currentLang === "vi" ? "Đã lưu tâm trạng!" : "오늘 컨디션 저장!";
  const message = currentLang === "vi"
    ? "HATI sẽ cổ vũ theo cảm xúc hôm nay của bạn."
    : "하티가 오늘 기분에 맞춰 응원할게요.";
  if (!els.hatiToast) {
    if (els.draftStatus) els.draftStatus.textContent = `${title} ${message}`;
    return;
  }
  els.hatiToastTitle.textContent = title;
  els.hatiToastMessage.textContent = message;
  els.hatiToast.dataset.hatiToastMood = "happy";
  els.hatiToast.classList.remove("is-visible");
  window.clearTimeout(showHatiPraise.timer);
  requestAnimationFrame(() => els.hatiToast.classList.add("is-visible"));
  showHatiPraise.timer = window.setTimeout(() => {
    els.hatiToast.classList.remove("is-visible");
  }, 2200);
  if (window.navigator?.vibrate) window.navigator.vibrate(8);
}

function praiseOnce(type) {
  const person = selectedStaff();
  if (!person || !els.date.value) return;
  const key = `${draftKey()}::${type}`;
  if (questPraiseKeys.has(key)) return;
  questPraiseKeys.add(key);
  showHatiPraise(type);
}

function popHati() {
  if (!els.employeePhone) return;
  els.employeePhone.classList.remove("is-hati-pop", "is-xp-pulse");
  void els.employeePhone.offsetWidth;
  els.employeePhone.classList.add("is-hati-pop", "is-xp-pulse");
  window.clearTimeout(popHati.timer);
  popHati.timer = window.setTimeout(() => {
    els.employeePhone?.classList.remove("is-xp-pulse");
  }, 820);
}

function readRealtimeCount(input) {
  if (input?.type === "checkbox") return input.checked ? 1 : 0;
  return clamp(Number(input?.value || 0), 0, 99);
}

function setRealtimeCount(input, value) {
  if (!input) return;
  if (input.type === "checkbox") {
    input.checked = Number(value || 0) > 0;
    return;
  }
  const max = input.max === "" ? 99 : Number(input.max || 99);
  input.value = String(clamp(Number(value || 0), 0, Number.isFinite(max) ? max : 99));
}

function renderPerformanceCards() {
  renderPerformanceGrid("hall", els.hallPerformanceGrid);
  renderPerformanceGrid("kitchen", els.kitchenPerformanceGrid);
  renderPerformanceGrid("marketer", els.marketerPerformanceGrid);
  refreshPerformanceInputs();
  syncLegacyPerformanceFields();
  updateSpecialCleanLastStatus();
}

function renderPerformanceGrid(role, grid) {
  if (!grid) return;
  const currentCounts = currentPerformanceCounts();
  const items = performanceItemsForRole(role);
  grid.classList.toggle("kitchen-clean-grid", role === "kitchen");
  grid.classList.toggle("marketer-grid", role === "marketer");
  grid.innerHTML = items.map((item) => {
    const count = currentCounts[item.id] || 0;
    const isSingleCheckRole = ["hall", "kitchen", "marketer"].includes(role);
    const max = Number(item.max || (isSingleCheckRole ? 1 : 99));
    const label = performanceItemLabel(item);
    const lastStatus = role === "kitchen"
      ? `<small class="special-clean-last-status" data-clean-status="${escapeHtml(item.id)}">${escapeHtml(kitchenLastStatusText(item))}</small>`
      : "";
    const done = count > 0;
    const actionText = role === "kitchen"
      ? (done ? (currentLang === "vi" ? "Đã clear" : "클리어 완료") : t("cleanReportButton"))
      : ["hall", "marketer"].includes(role)
        ? (done ? (currentLang === "vi" ? "Đã hoàn thành" : "완료됨") : t("reportButton"))
        : t("reportButton");
    return `
      <div class="realtime-card small ${role === "kitchen" ? "kitchen-clean-card" : ""} ${role === "hall" ? "hall-mission-card" : ""} ${role === "marketer" ? "marketer-mission-card" : ""}" data-performance-card="${escapeHtml(item.id)}">
        <strong>${escapeHtml(label)}</strong>
        <small>${currentLang === "vi" ? `Điểm thành tích +${item.xp}` : `성과 포인트 +${item.xp}`}</small>
        ${lastStatus}
        <div class="realtime-counter" aria-label="${escapeHtml(label)}">
          <button class="realtime-minus" type="button" data-realtime-adjust="${escapeHtml(item.id)}" data-delta="-1" aria-label="${escapeHtml(label)} 취소">-</button>
          <input id="${escapeHtml(item.id)}" class="realtime-count performance-count" data-performance-role="${role}" data-performance-item="${escapeHtml(item.id)}" type="number" min="0" max="${max}" value="${Math.min(count, max)}" inputmode="numeric" ${isSingleCheckRole ? "readonly" : ""} />
          <button class="realtime-plus report-button" type="button" data-realtime-adjust="${escapeHtml(item.id)}" data-delta="1" ${isSingleCheckRole && done ? "disabled" : ""}>${actionText}</button>
        </div>
      </div>
    `;
  }).join("");
}

function refreshPerformanceInputs() {
  els.reviewPoint = document.querySelector("#reviewPoint");
  els.upsellPoint = document.querySelector("#upsellPoint");
  els.membershipPoint = document.querySelector("#membershipPoint");
  els.recommendedMenuPoint = document.querySelector("#recommendedMenuPoint");
  els.hygieneFixPoint = ensureHiddenPerformanceInput("hygieneFixPoint");
  els.threadPostPoint = document.querySelector("#threadPostPoint");
  els.videoPostPoint = document.querySelector("#videoPostPoint");
  els.tomorrowPlanPoint = document.querySelector("#tomorrowPlanPoint");
  els.marketingReportPoint = document.querySelector("#marketingReportPoint");
}

function ensureHiddenPerformanceInput(id) {
  let input = document.querySelector(`#${id}`);
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.id = id;
    input.value = "0";
    els.kitchenPointBox?.appendChild(input);
  }
  return input;
}

function ensureLaunchPerformanceInput(id, item = performanceItemById(id)) {
  let input = document.getElementById(id);
  if (input) return input;
  input = document.createElement("input");
  input.type = "hidden";
  input.id = id;
  input.value = "0";
  input.className = "performance-count";
  input.dataset.performanceRole = item?.role || "hall";
  input.dataset.performanceItem = id;
  input.min = "0";
  input.max = String(item?.max || 1);
  els.form?.appendChild(input);
  return input;
}

function currentPerformanceCounts() {
  return Object.fromEntries([...document.querySelectorAll(".performance-count")]
    .map((input) => [input.dataset.performanceItem || input.id, readRealtimeCount(input)]));
}

function performanceItemsForRole(role) {
  const settings = normalizePerformanceItems(state.storeSettings?.performanceItems);
  if (role === "kitchen") return settings.kitchen;
  if (role === "marketer") return settings.marketer;
  return settings.hall;
}

function allPerformanceItems() {
  const settings = normalizePerformanceItems(state.storeSettings?.performanceItems);
  return [...settings.hall, ...settings.kitchen, ...settings.marketer];
}

function performanceItemById(id) {
  return allPerformanceItems().find((item) => item.id === id);
}

function performanceItemLabel(item) {
  if (!item) return "";
  return currentLang === "vi" ? (item.vi || item.ko || item.label || item.id) : (item.ko || item.label || item.vi || item.id);
}

function performanceReportPayload() {
  return [...document.querySelectorAll(".performance-count")]
    .map((input) => {
      const item = performanceItemById(input.dataset.performanceItem || input.id);
      const count = readRealtimeCount(input);
      if (!item || count <= 0) return null;
      return {
        id: item.id,
        role: input.dataset.performanceRole || item.role || "",
        areaId: item.areaId || "",
        label: performanceItemLabel(item),
        xp: Number(item.xp || 10),
        count,
      };
    })
    .filter(Boolean);
}

function setPerformanceReportCounts(source = {}) {
  const reports = Array.isArray(source.performanceReports) ? source.performanceReports : [];
  const counts = Object.fromEntries(reports.map((report) => [report.id, Number(report.count || 0)]));
  if (!reports.length) {
    counts.reviewPoint = Number(source.reviewPoint || 0);
    counts.upsellPoint = Number(source.upsellPoint || 0);
    counts.membershipPoint = Number(source.membershipPoint || 0);
    counts.recommendedMenuPoint = Number(source.recommendedMenuPoint || 0);
    counts.threadPostPoint = Number(source.threadPostPoint || 0);
    counts.videoPostPoint = Number(source.videoPostPoint || 0);
    counts.tomorrowPlanPoint = Number(source.tomorrowPlanPoint || 0);
    counts.marketingReportPoint = Number(source.marketingReportPoint || 0);
    if (source.specialCleanArea && Number(source.hygieneFixPoint || 0) > 0) {
      const item = performanceItemsForRole("kitchen").find((candidate) => candidate.areaId === source.specialCleanArea || candidate.id === source.specialCleanArea);
      if (item) counts[item.id] = 1;
    }
  }
  document.querySelectorAll(".performance-count").forEach((input) => {
    setRealtimeCount(input, counts[input.dataset.performanceItem || input.id] || 0);
  });
  syncLegacyPerformanceFields();
  updateSpecialCleanLastStatus();
}

function clearPerformanceCounts() {
  document.querySelectorAll(".performance-count").forEach((input) => setRealtimeCount(input, 0));
  syncLegacyPerformanceFields();
  updateSpecialCleanLastStatus();
}

function legacyPerformanceFromReports(reports = performanceReportPayload()) {
  const get = (id) => reports.find((report) => report.id === id)?.count || 0;
  const kitchenReports = reports.filter((report) => report.role === "kitchen");
  const firstKitchen = kitchenReports[0];
  return {
    reviewPoint: get("reviewPoint"),
    upsellPoint: get("upsellPoint"),
    membershipPoint: get("membershipPoint"),
    recommendedMenuPoint: get("recommendedMenuPoint"),
    hygieneFixPoint: kitchenReports.reduce((sum, report) => sum + Number(report.count || 0), 0),
    specialCleanArea: firstKitchen?.areaId || firstKitchen?.id || "",
    specialCleanXp: kitchenReports.reduce((sum, report) => sum + Number(report.count || 0) * performanceReportXpValue(report), 0),
    threadPostPoint: get("threadPostPoint"),
    videoPostPoint: get("videoPostPoint"),
    tomorrowPlanPoint: get("tomorrowPlanPoint"),
    marketingReportPoint: get("marketingReportPoint"),
  };
}

function syncLegacyPerformanceFields() {
  const legacy = legacyPerformanceFromReports();
  setRealtimeCount(els.hygieneFixPoint, legacy.hygieneFixPoint);
  if (els.specialCleanArea) els.specialCleanArea.value = legacy.specialCleanArea;
  updateSpecialCleanXpLabel();
}

function performanceReportsXp(entry) {
  const reports = Array.isArray(entry?.performanceReports) ? entry.performanceReports : [];
  if (reports.length) {
    return reports.reduce((sum, report) => sum + Number(report.count || 0) * performanceReportXpValue(report), 0);
  }
  return (Number(entry.reviewPoint || 0) * 10)
    + (Number(entry.upsellPoint || 0) * 10)
    + (Number(entry.membershipPoint || 0) * 10)
    + (Number(entry.recommendedMenuPoint || 0) * 10)
    + specialCleanXpFromEntry(entry)
    + (Number(entry.threadPostPoint || 0) * 10)
    + (Number(entry.videoPostPoint || 0) * 10)
    + (Number(entry.tomorrowPlanPoint || 0) * 10)
    + (Number(entry.marketingReportPoint || 0) * 10);
}

function performanceReportXpValue(report) {
  return ["kitchen", "marketer"].includes(report?.role) ? 10 : Number(report?.xp || 1);
}

function performanceReportsForRole(entry, role) {
  const reports = Array.isArray(entry?.performanceReports) ? entry.performanceReports : [];
  return reports.filter((report) => report.role === role);
}

function kitchenLastStatusText(item) {
  if (!item) return "";
  if (readRealtimeCount(document.querySelector(`#${CSS.escape(item.id)}`)) > 0) return t("specialCleanLastToday");
  const record = lastSpecialCleanRecord(item.areaId || item.id);
  if (!record) return t("specialCleanNoHistory");
  const days = daysBetweenDates(record.date, els.date.value || toInputDate(new Date()));
  return days <= 0
    ? t("specialCleanLastToday")
    : t("specialCleanLastDays").replace("{date}", record.date).replace("{days}", days);
}

function specialCleanOption(id = els.specialCleanArea?.value) {
  const item = performanceItemsForRole("kitchen").find((area) => area.id === id || area.areaId === id);
  if (item) return { id: item.areaId || item.id, xp: item.xp, ko: item.ko, vi: item.vi };
  return specialCleanAreas.find((area) => area.id === id);
}

function selectedKitchenReports() {
  return performanceReportPayload().filter((report) => report.role === "kitchen");
}

function specialCleanLabel(id) {
  if (arguments.length === 0) {
    return selectedKitchenReports().map((report) => report.label).join(", ");
  }
  const option = specialCleanOption(id);
  if (!option) return "";
  return option[currentLang] || option.ko;
}

function selectedSpecialCleanXp() {
  return selectedKitchenReports()
    .reduce((sum, report) => sum + Number(report.count || 0) * performanceReportXpValue(report), 0);
}

function specialCleanXpFromEntry(entry) {
  const reportXp = performanceReportsForRole(entry, "kitchen")
    .reduce((sum, report) => sum + Number(report.count || 0) * performanceReportXpValue(report), 0);
  if (reportXp > 0) return reportXp;
  const count = Number(entry?.hygieneFixPoint || 0);
  if (!count) return 0;
  return count * 10;
}

function renderSpecialCleanOptions(selectedValue = els.specialCleanArea?.value || "") {
  if (!els.specialCleanArea) {
    updateSpecialCleanXpLabel();
    updateSpecialCleanLastStatus();
    return;
  }
  els.specialCleanArea.innerHTML = [
    `<option value="">${t("specialCleanPlaceholder")}</option>`,
    ...specialCleanAreas.map((area) => (
      `<option value="${area.id}">${escapeHtml(area[currentLang] || area.ko)} · ${area.xp} XP</option>`
    )),
  ].join("");
  els.specialCleanArea.value = specialCleanOption(selectedValue) ? selectedValue : "";
  updateSpecialCleanXpLabel();
  updateSpecialCleanLastStatus();
}

function updateSpecialCleanXpLabel() {
  if (!els.specialCleanXpLabel) return;
  const selected = selectedKitchenReports();
  const xp = selectedSpecialCleanXp();
  els.specialCleanXpLabel.textContent = selected.length
    ? `${selected.length}${currentLang === "vi" ? " mục" : "개 구역"} · +${xp} XP`
    : t("specialCleanXpHelp");
}

function updateSpecialCleanLastStatus() {
  document.querySelectorAll("[data-clean-status]").forEach((node) => {
    const item = performanceItemById(node.dataset.cleanStatus);
    if (!item) return;
    const text = kitchenLastStatusText(item);
    node.textContent = text;
    const record = lastSpecialCleanRecord(item.areaId || item.id);
    const days = record ? daysBetweenDates(record.date, els.date.value || toInputDate(new Date())) : 999;
    const checked = readRealtimeCount(document.querySelector(`#${CSS.escape(item.id)}`)) > 0;
    node.classList.toggle("is-fresh", checked || days <= 2);
    node.classList.toggle("is-old", !checked && days >= 7);
  });
}

function lastSpecialCleanRecord(areaId) {
  if (!areaId) return undefined;
  const targetDate = els.date.value || toInputDate(new Date());
  const personal = (state.personalEntries || []).map((entry) => ({ ...entry, status: "approved" }));
  const selfChecks = (state.selfChecks || []).filter((entry) => entry.status !== "rejected");
  return [...personal, ...selfChecks]
    .filter((entry) => (
      (entry.specialCleanArea === areaId || performanceReportsForRole(entry, "kitchen").some((report) => report.areaId === areaId || report.id === areaId)) &&
      (Number(entry.hygieneFixPoint || 0) > 0 || performanceReportsForRole(entry, "kitchen").some((report) => Number(report.count || 0) > 0)) &&
      entry.date &&
      entry.date <= targetDate
    ))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))[0];
}

function daysBetweenDates(startDate, endDate) {
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  return Math.max(0, Math.round((end - start) / 86400000));
}

async function submitSelfCheck(event) {
  event?.preventDefault?.();
  await ensureCloudStaffReady();
  const person = selectedStaff();
  if (!person) {
    alert(currentLang === "vi" ? "Vui lòng mở bằng link cá nhân để ghi nhận." : "직원 전용 링크로 접속한 뒤 기록할 수 있어요.");
    return;
  }

  const date = els.date.value;
  await refreshCurrentSelfCheckFromCloud(person, date);
  const alreadySubmitted = (state.selfChecks || []).some((entry) => (
    entry.date === date && entry.staffId === person.id && entry.status === "pending"
  ));
  const alreadyRecorded = (state.personalEntries || []).some((entry) => entry.date === date && entry.staffId === person.id);
  if (!isFreshTestMode && (alreadySubmitted || alreadyRecorded)) {
    alert(t("duplicateAlert"));
    return;
  }
  if (questEnabled("cleaning") && !cleaningQuestDone()) {
    completeCheckoutGuard({ skipAutosave: true, quiet: true });
  }
  const missingRequired = requiredQuestMissing();
  if (missingRequired.length) {
    alert(`${t("requiredQuestAlert")}${missingRequired.join(", ")}`);
    guideMissingRequiredQuest();
    return;
  }
  checkoutTime = formatClockTime(new Date());
  renderCheckoutTime();
  const helpCount = readRealtimeCount(els.helpCount);
  const hasHelpRecord = helpCount > 0;
  const reviewCount = readRealtimeCount(els.reviewPoint);
  const performanceReports = performanceReportPayload();
  const legacy = legacyPerformanceFromReports(performanceReports);

  const entry = {
    id: uniqueId(),
    date,
    staffId: person.id,
    staffName: visibleStaffName(person, 0),
    role: person.role,
    roleName: roleLabel(person.role),
    attendance: questEnabled("attendance") ? (els.attendance.checked ? 1 : 0) : 1,
    attendanceTime,
    checkinMood,
    checkoutTime,
    cleaningDone: questEnabled("cleaning") && els.cleaning.checked,
    cleanArea: questEnabled("cleaning") ? (els.cleanArea?.value || "") : "",
    cleanStatus: questEnabled("cleaning") ? (els.cleanStatus?.value || "") : "",
    goalChecked: questEnabled("goal") && els.goal.checked,
    goalType: questEnabled("goal") && els.goal.checked ? operationPointSummary() : "",
    helpSkipped: questEnabled("help") && praiseSkipped,
    helpCount: questEnabled("help") ? helpCount : 0,
    helpType: questEnabled("help") && hasHelpRecord ? (els.helpType.value || t("helpLabel")) : "",
    helpReason: questEnabled("help") && hasHelpRecord ? (els.helpReason?.value || "") : "",
    helpNote: questEnabled("help") && hasHelpRecord ? (els.helpNote?.value.trim() || "") : "",
    photos: questEnabled("photo") ? photos : [],
    photoName: questEnabled("photo") ? (photos[0]?.name || "") : "",
    photoDataUrl: questEnabled("photo") ? (photos[0]?.dataUrl || "") : "",
    performanceReports: questEnabled("serviceXp") ? performanceReports.filter((report) => (
      (isHallRole(person.role) && report.role === "hall") ||
      (isKitchenRole(person.role) && report.role === "kitchen") ||
      (isMarketerRole(person.role) && report.role === "marketer")
    )) : [],
    upsellPoint: questEnabled("serviceXp") && isHallRole(person.role) ? legacy.upsellPoint : 0,
    membershipPoint: questEnabled("serviceXp") && isHallRole(person.role) ? legacy.membershipPoint : 0,
    reviewPoint: questEnabled("serviceXp") && isHallRole(person.role) ? reviewCount : 0,
    recommendedMenuPoint: questEnabled("serviceXp") && isHallRole(person.role) ? legacy.recommendedMenuPoint : 0,
    hygieneFixPoint: questEnabled("serviceXp") && isKitchenRole(person.role) ? legacy.hygieneFixPoint : 0,
    specialCleanArea: questEnabled("serviceXp") && isKitchenRole(person.role) ? legacy.specialCleanArea : "",
    specialCleanXp: questEnabled("serviceXp") && isKitchenRole(person.role) ? legacy.specialCleanXp : 0,
    threadPostPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? legacy.threadPostPoint : 0,
    videoPostPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? legacy.videoPostPoint : 0,
    tomorrowPlanPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? legacy.tomorrowPlanPoint : 0,
    marketingReportPoint: questEnabled("serviceXp") && isMarketerRole(person.role) ? legacy.marketingReportPoint : 0,
    note: els.note.value.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  saveDraft({ showMessage: false });
  const previousSelfChecks = cloneStateList(state.selfChecks);
  const previousAnalyticsEvents = cloneStateList(state.analyticsEvents);
  const existingLive = (state.selfChecks || []).find((item) => (
    item.date === date && item.staffId === person.id && item.status === "live"
  ));
  const submittedEntryId = existingLive?.id || entry.id;
  if (existingLive) {
    Object.assign(existingLive, {
      ...entry,
      id: existingLive.id,
      createdAt: existingLive.createdAt || entry.createdAt,
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } else {
    state.selfChecks = [...(state.selfChecks || []), { ...entry, submittedAt: new Date().toISOString() }];
  }
  appendAnalyticsEvent(state, "employee_checkout", {
    actorRole: "employee",
    entryId: submittedEntryId,
    staffId: person.id,
    staffName: visibleStaffName(person, 0),
    role: person.role,
    date,
    checkoutTime,
    dedupeKey: `${date}:${person.id}:employee_checkout`,
  });
  appendAnalyticsEvent(state, "employee_submit", {
    actorRole: "employee",
    entryId: submittedEntryId,
    staffId: person.id,
    staffName: visibleStaffName(person, 0),
    role: person.role,
    date,
    dedupeKey: `${date}:${person.id}:employee_submit`,
  });
  const saved = await saveState({ critical: true });
  if (!saved) {
    state.selfChecks = previousSelfChecks;
    state.analyticsEvents = previousAnalyticsEvents;
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
    const message = currentLang === "vi"
      ? "Chưa đồng bộ được với màn hình quản lý. Kiểm tra mạng rồi gửi lại."
      : "매니저 화면에 아직 동기화되지 않았어요. 인터넷 연결을 확인하고 다시 제출해주세요.";
    setDraftStatus(message);
    renderHistory();
    alert(message);
    return;
  }
  lastSubmitFeedback = {
    date,
    staffId: person.id,
    time: checkoutTime,
    createdAt: Date.now(),
  };
  try {
    clearDraft(date, person.id);
    resetForm(date);
    renderHistory();
    renderRankings();
    showHatiPraise("checkout");
    setEmployeeTab("home", { scroll: false });
  } catch (error) {
    console.warn(error);
    setDraftStatus(t("draftSubmittedStatus"));
  }
}

function cloneStateList(list) {
  try {
    return JSON.parse(JSON.stringify(Array.isArray(list) ? list : []));
  } catch {
    return Array.isArray(list) ? list.map((item) => ({ ...item })) : [];
  }
}

async function refreshCurrentSelfCheckFromCloud(person, date) {
  if (typeof cloudEnabled !== "function" || !cloudEnabled() || !person || !date) return;
  try {
    const cloudState = await withTimeout(loadStateFromCloud(), cloudReadTimeoutMs);
    if (!cloudState) return;
    const cloudChecks = Array.isArray(cloudState.selfChecks) ? cloudState.selfChecks : [];
    const currentCloudChecks = cloudChecks.filter((entry) => entry.date === date && entry.staffId === person.id);
    state.personalEntries = Array.isArray(cloudState.personalEntries) ? cloudState.personalEntries : state.personalEntries;
    if (!currentCloudChecks.length) return;
    const otherLocalChecks = (state.selfChecks || []).filter((entry) => !(entry.date === date && entry.staffId === person.id));
    state.selfChecks = upsertChecksById([...otherLocalChecks, ...currentCloudChecks]);
    localStorage.setItem(appStorageKey(), JSON.stringify(state));
  } catch (error) {
    console.warn(error);
  }
}

function requiredQuestMissing() {
  const missing = [];
  if (questEnabled("attendance") && !els.attendance.checked) missing.push(t("attendanceTitle"));
  if (questEnabled("goal") && !els.goal.checked) missing.push(t("goalTitle"));
  if (questEnabled("cleaning") && (!els.cleaning?.checked || !els.cleanArea?.value)) missing.push(t("cleaningTitle"));
  return missing;
}

function guideMissingRequiredQuest() {
  if (questEnabled("attendance") && !els.attendance?.checked) {
    setEmployeeTab("checkin", { scroll: true });
    setDraftStatus(currentLang === "vi" ? "Hãy bấm chấm công trước." : "출근 탭에서 출근 체크를 먼저 눌러주세요.");
    highlightCheckinAction();
    return;
  }
  if (questEnabled("goal") && !els.goal?.checked) {
    setEmployeeTab("checkin", { scroll: true });
    setDraftStatus(currentLang === "vi" ? "Bấm Mở mục tiêu để xác nhận điểm vận hành hôm nay." : "출근 탭에서 목표 열기를 누르면 오늘 목표 맵 확인이 완료돼요.");
    highlightCheckinAction();
    return;
  }
  if (questEnabled("cleaning") && (!els.cleaning?.checked || !els.cleanArea?.value)) {
    setEmployeeTab("mission", { scroll: true });
    setDraftStatus(currentLang === "vi" ? "Hãy gửi kiểm tra cuối ca." : "퇴근 탭에서 마감 상태를 확인하고 제출해주세요.");
  }
}

function highlightCheckinAction() {
  window.setTimeout(() => {
    const button = els.employeeTabContent?.querySelector("[data-checkin-action]");
    button?.classList.add("needs-attention");
    button?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => button?.classList.remove("needs-attention"), 1800);
  }, 80);
}

function resetForm(date) {
  els.form.reset();
  els.date.value = date;
  els.attendance.checked = false;
  attendanceTime = "";
  checkoutTime = "";
  checkinMood = "";
  pendingCheckinAfterMood = false;
  praiseSkipped = false;
  updateCloseArea();
  if (els.cleanStatus) els.cleanStatus.value = "";
  setRealtimeCount(els.helpCount, 0);
  setRealtimeCount(els.reviewPoint, 0);
  setRealtimeCount(els.upsellPoint, 0);
  setRealtimeCount(els.membershipPoint, 0);
  setRealtimeCount(els.recommendedMenuPoint, 0);
  setRealtimeCount(els.threadPostPoint, 0);
  setRealtimeCount(els.videoPostPoint, 0);
  setRealtimeCount(els.tomorrowPlanPoint, 0);
  setRealtimeCount(els.marketingReportPoint, 0);
  if (els.specialCleanArea) els.specialCleanArea.value = "";
  setRealtimeCount(els.hygieneFixPoint, 0);
  updateSpecialCleanXpLabel();
  updateSpecialCleanLastStatus();
  if (els.helpType) els.helpType.value = "";
  if (els.helpReason) els.helpReason.value = "";
  if (els.helpNote) els.helpNote.value = "";
  photos = [];
  els.photoPreview.classList.add("is-hidden");
  els.photoPreview.innerHTML = "";
  renderAttendanceTime();
  renderCheckoutTime();
  renderPhotoPreview();
  renderStaffOptions();
  if (els.draftStatus) els.draftStatus.textContent = t("draftSubmittedStatus");
  updateQuestProgress();
}

function renderHistory() {
  const staffId = els.staffSelect.value;
  const rows = (state.selfChecks || [])
    .filter((entry) => entry.staffId === staffId)
    .slice(-8)
    .reverse();

  if (!rows.length) {
    els.history.innerHTML = `<div class="empty-state">${t("noHistory")}</div>`;
    return;
  }

  els.history.innerHTML = rows.map((entry) => `
    <article class="history-item">
      <strong>${entry.date}</strong>
      <span class="status-badge ${entry.status}">${statusLabel(entry.status)}</span>
      <small>${selfCheckSummary(entry)}</small>
    </article>
  `).join("");
}

function renderRankings() {
  renderRankingList(els.weeklyRanking, buildWeeklyRows(), "weekly");
  renderRankingList(els.monthlyRanking, buildMonthlyRows(), "monthly");
}

function setEmployeeTab(tab, options = {}) {
  const selectedTab = ["home", "checkin", "mission", "performance", "my"].includes(tab) ? tab : "home";
  document.body.dataset.employeeTab = selectedTab;
  els.employeePhone?.setAttribute("data-active-tab", selectedTab);
  if (els.employeePhone) {
    els.employeePhone.classList.remove("is-hati-pop");
    void els.employeePhone.offsetWidth;
    els.employeePhone.classList.add("is-hati-pop");
  }
  els.employeeTabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.employeeTab === selectedTab);
  });
  document.querySelectorAll("[data-focus-tab]").forEach((node) => {
    node.classList.toggle("is-tab-focus", node.dataset.focusTab === selectedTab);
  });
  renderEmployeeTabPanel(selectedTab);
  if (options.scroll === false) return;
  const target = {
    home: els.employeeTabPanel,
    checkin: els.employeeTabPanel,
    mission: els.employeeTabPanel,
    performance: els.employeeTabPanel,
    ranking: els.employeeTabPanel,
    my: els.employeeTabPanel,
  }[selectedTab];
  requestAnimationFrame(() => {
    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}

function employeeCopy() {
  if (currentLang === "vi") {
    return {
      homeTitle: "Sảnh LEVO",
      homeText: "Bắt đầu chuyến phiêu lưu hôm nay cùng LEVO.",
      checkinTitle: "Bắt đầu phiêu lưu",
      checkinText: "Chấm công để mở nhiệm vụ hôm nay.",
      checkinDoneText: "Giờ vào ca đã được ghi. Xem mục tiêu hôm nay để bắt đầu ca làm.",
      checkoutTitle: "Nhiệm vụ kết ca",
      checkoutText: "Hoàn thành kiểm tra cuối ngày để khép lại nhiệm vụ.",
      performanceTitle: "Nhiệm vụ tăng trưởng",
      performanceText: "Ghi nhận khoảnh khắc khách vui, gợi ý thành công và đóng góp nhỏ.",
      rankingTitle: "Sảnh danh vọng",
      rankingText: "Xem các danh hiệu review, gợi ý, khen ngợi và vệ sinh.",
      myTitle: "Của tôi",
      myText: "Xem lịch sử gửi, trạng thái duyệt, streak và quá trình phát triển.",
      selectStaffName: "Hãy mở bằng link cá nhân",
      scheduledStaffRole: "Nhân viên theo lịch",
      startDone: "Sẵn sàng bắt đầu",
      goalCheck: "Mở mục tiêu",
      checkinAction: "Bắt đầu 🚀",
      pickMoodFirst: "Chọn tâm trạng trước",
      pickMoodHelp: "Chọn một tâm trạng ở trên rồi bấm bắt đầu.",
      moodReady: "Đã chọn tâm trạng. Bấm bắt đầu để mở mục tiêu hôm nay.",
      workStarted: "Nhiệm vụ đã bắt đầu",
      goalMeta: "Mở bản đồ hôm nay",
      firstTodo: "Nhiệm vụ đầu tiên",
      noRecordYet: "Chưa ghi",
      approvedHint: "Quản lý đã duyệt",
      pendingHint: "Đang chờ quản lý duyệt",
      liveHint: "Đang tự lưu trong ca",
      emptyHint: "Hôm nay chưa có ghi nhận",
      noRankingMini: "Chưa có dữ liệu xếp hạng",
      noRecentMini: "Chưa có lịch sử gửi",
      todayHome: "Trang hôm nay",
      requiredProgress: "Tiến độ nhiệm vụ chính",
      flowAttendance: "Mở cổng",
      flowAttendanceMeta: "Bắt đầu ngày chơi",
      flowGoal: "Mở bản đồ",
      flowGoalMeta: "Nhiệm vụ và điểm cần chú ý",
      flowPerformance: "Nhặt huy hiệu",
      recordingSuffix: "đang ghi",
      onlyWhenNeeded: "Chỉ ghi khi có kết quả",
      flowCheckout: "Kết nhiệm vụ",
      flowCheckoutMeta: "Kiểm tra cuối ngày",
      flowApproval: "LEVO lưu lại",
      performanceReport: "Nhận huy hiệu",
      savedSuffix: "đã lưu",
      wheneverItHappens: "Khi có kết quả",
      noPerformanceToday: "Hôm nay chưa có thành tích riêng",
      submitNoPerformance: "Không có thành tích · gửi tan ca",
      noPerformanceGuide: "Nếu hôm nay không có review/bán thêm/vệ sinh đặc biệt, vẫn có thể gửi cuối ca bình thường.",
      checkoutDone: "Đã tan ca",
      doneSuffix: "hoàn thành",
      approvalStatus: "Trạng thái duyệt",
      justNow: "Vừa xong",
      checkinCompleted: "đã chấm công!",
      tapCheckin: "Hãy bấm chấm công",
      checkinGuide: "Sau khi vào ca, xem mục tiêu hôm nay. Giờ tan ca sẽ ghi ở bước cuối.",
      checkinNextAttendance: "Hãy bấm chấm công bên dưới trước.",
      checkinNextGoal: "Xem mục tiêu vận hành để sẵn sàng bắt đầu ca.",
      checkinPageReadyTitle: "Bắt đầu ca",
      checkinPageReadyText: "Bấm chấm công để xem mục tiêu hôm nay.",
      checkinPageDoneTitle: "Mục tiêu hôm nay",
      checkinCheer: "Hôm nay cố lên nhé!",
      checkinGoalDoneButton: "Đã xem mục tiêu",
      checkinGoalCompleteText: "Đã sẵn sàng bắt đầu ca.",
      checkoutRecordedMini: "đã ghi giờ tan ca",
      checkoutNotYet: "Chưa ghi giờ tan ca.",
      viewCheckout: "Xem giờ tan ca",
      goCheckout: "Đi chấm tan ca",
      checkoutBeforeTitle: "Kiểm tra trước khi về",
      checkoutGuide: "Kiểm tra cuối ca rồi bấm gửi. Thời gian hiện tại sẽ được ghi là giờ tan ca.",
      performanceGuide: "Bấm nhận huy hiệu là tự lưu ngay. XP sẽ cộng chính thức sau khi xác nhận.",
      review: "Khách vui",
      upsell: "Gợi ý thành công",
      membership: "Kết nối",
      recommended: "Món đề xuất",
      weeklyTop3: "TOP 3 tuần này",
      weeklyFocusTitle: "Thành tích tuần này",
      weeklyFocusMeta: "7 ngày gần đây",
      weeklyReviewMembership: "Review + membership",
      weeklySalesTitle: "Upsell + món đề xuất",
      weeklyTeamPraise: "Lời khen teamwork",
      weeklyCleanTitle: "Vệ sinh đặc biệt",
      weeklyCountUnit: "lần",
      weeklyXpUnit: "XP",
      myRankPrefix: "Hạng của tôi",
      myRankWaiting: "Đang chờ hạng của tôi",
      myProfile: "Hồ sơ của tôi",
      rankShort: "Hạng ",
      rankSuffix: "",
      rankingWaiting: "Chờ xếp hạng",
      todayStatus: "Trạng thái hôm nay",
      recentSubmit: "Gửi gần đây",
      pendingXpLabel: "XP chờ duyệt",
      approvedXpLabel: "XP đã duyệt",
      noPendingXp: "Chưa có XP chờ duyệt",
      growthTitle: "HATI đang lớn lên",
      growthMeta: "Cấp {level} · {stage}",
      nextLevelRemaining: "Còn {xp} XP để lên cấp tiếp theo",
      nextLevelReady: "Đã đạt cấp tối đa!",
      rewardChestTitle: "Rương thưởng hôm nay",
      rewardChestLocked: "Hoàn thành 3 nhiệm vụ chính để mở",
      rewardChestOpen: "Rương đã sẵn sàng. Gửi cuối ca để quản lý duyệt.",
      rewardChestXp: "XP dự kiến hôm nay",
      trophyAttendance: "Vào ca",
      trophyGoal: "Mục tiêu",
      trophyPerformance: "Thành tích",
      trophyCheckout: "Tan ca",
      trophyApproval: "Duyệt",
      trophyDone: "Xong",
      trophyWaiting: "Chờ",
      todayResultTitle: "Kết quả hôm nay",
      todayResultText: "Gửi cuối ca xong, XP sẽ được cộng sau khi quản lý duyệt.",
      submitSuccessTitle: "Hôm nay bạn làm rất tốt!",
      submitSuccessText: "Đã gửi chấm tan ca lúc {time}. HATI sẽ báo quản lý duyệt XP.",
      stageSeed: "HATI mầm",
      stageActive: "HATI năng lượng",
      stageGrow: "HATI trưởng thành",
      stagePro: "HATI chuyên nghiệp",
      stageAce: "HATI át chủ bài",
      stageLegend: "HATI huyền thoại",
    };
  }
  return {
    homeTitle: "LEVO 로비",
    homeText: "오늘의 성장 모험을 시작해요.",
    checkinTitle: "모험 시작",
    checkinText: "출근 체크로 오늘의 퀘스트를 열어요.",
    checkinDoneText: "오늘 모험이 시작됐어요. 목표 맵을 열고 가볍게 시작해요.",
    checkoutTitle: "마감 퀘스트",
    checkoutText: "마지막 가드 체크를 완료하고 오늘 모험을 마무리해요.",
    performanceTitle: "성장 미션",
    performanceText: "고객이 웃은 순간, 추천 성공, 팀 도움을 배지처럼 모아요.",
    rankingTitle: "명예의 전당",
    rankingText: "리뷰왕, 업셀왕, 칭찬왕, 청소왕 배지를 확인해요.",
    myTitle: "마이",
    myText: "내 제출 기록, 승인 상태, streak와 성장 기록을 확인해요.",
    selectStaffName: "직원을 선택해주세요",
    scheduledStaffRole: "근무 예정 직원",
    startDone: "시작 준비 완료",
    goalCheck: "목표 열기",
      checkinAction: "모험 시작 🚀",
      pickMoodFirst: "기분 먼저 선택",
      pickMoodHelp: "위에서 오늘 기분을 고르면 모험 시작 버튼이 열려요.",
      moodReady: "기분 선택 완료. 모험 시작을 누르면 목표맵이 열려요.",
      workStarted: "오늘 퀘스트 시작!",
    goalMeta: "오늘 맵 열기",
    firstTodo: "첫 번째 퀘스트",
    noRecordYet: "기록 전",
    approvedHint: "매니저 승인 완료",
    pendingHint: "매니저 승인 대기",
    liveHint: "근무 중 자동 저장",
    emptyHint: "아직 오늘 기록 없음",
    noRankingMini: "아직 랭킹 기록이 없어요",
    noRecentMini: "아직 제출 기록이 없어요",
    todayHome: "오늘의 홈",
    requiredProgress: "필수 미션 진행률",
    flowAttendance: "입장 완료",
    flowAttendanceMeta: "오늘 모험 시작",
    flowGoal: "목표 맵 열기",
    flowGoalMeta: "오늘 집중할 퀘스트",
    flowPerformance: "배지 획득",
    recordingSuffix: "기록 중",
    onlyWhenNeeded: "있을 때만 바로 신고",
    flowCheckout: "마감 퀘스트",
    flowCheckoutMeta: "마지막 가드 체크",
    flowApproval: "LEVO 저장",
    performanceReport: "배지 획득",
    savedSuffix: "저장됨",
    wheneverItHappens: "생길 때마다",
    noPerformanceToday: "오늘 별도 성과 없음",
    submitNoPerformance: "성과 없음 · 퇴근 제출",
    noPerformanceGuide: "오늘 리뷰/판매/특수청소 성과가 없어도 퇴근 점검은 그대로 제출할 수 있어요.",
    checkoutDone: "퇴근 완료",
    doneSuffix: "완료",
    approvalStatus: "승인 상태",
    justNow: "방금",
    checkinCompleted: "출근 완료!",
    tapCheckin: "출근 체크를 눌러주세요",
    checkinGuide: "출근 후 바로 아래에서 오늘 운영 포인트를 확인해요. 퇴근 입력은 마지막 점검 때 합니다.",
    checkinNextAttendance: "아래 출근 체크를 먼저 눌러주세요.",
    checkinNextGoal: "오늘 운영 포인트까지 확인하면 시작 준비 완료예요.",
    checkinPageReadyTitle: "출근 체크",
    checkinPageReadyText: "출근 체크를 누르면 오늘의 목표가 바로 보여요.",
    checkinPageDoneTitle: "오늘의 목표",
    checkinCheer: "오늘도 화이팅입니다",
    checkinGoalDoneButton: "목표 확인 완료",
    checkinGoalCompleteText: "오늘 근무 시작 준비 완료예요.",
    checkoutRecordedMini: "퇴근 기록됨",
    checkoutNotYet: "퇴근시간은 아직 기록 전이에요.",
    viewCheckout: "퇴근 기록 확인",
    goCheckout: "퇴근 체크하러 가기",
    checkoutBeforeTitle: "퇴근 전 마감 확인",
    checkoutGuide: "마감 확인 후 “퇴근 체크하고 제출”을 누르면 현재 시간이 퇴근시간으로 저장돼요.",
    performanceGuide: "배지를 누르면 바로 자동 저장돼요. 최종 XP는 확인 후 반영됩니다.",
    review: "고객 미소",
    upsell: "추천 성공",
    membership: "연결 성공",
    recommended: "메뉴 추천",
    weeklyTop3: "이번주 TOP 3",
    weeklyFocusTitle: "이번주 성장 지표",
    weeklyFocusMeta: "최근 7일",
    weeklyReviewMembership: "리뷰+멤버십",
    weeklySalesTitle: "업셀+추천메뉴",
    weeklyTeamPraise: "팀워크 칭찬",
    weeklyCleanTitle: "특수 청소",
    weeklyCountUnit: "건",
    weeklyXpUnit: "XP",
    myRankPrefix: "내 순위",
    myRankWaiting: "내 순위 대기",
    myProfile: "마이 프로필",
    rankShort: "순위 ",
    rankSuffix: "위",
    rankingWaiting: "랭킹 대기",
    todayStatus: "오늘 기록 상태",
    recentSubmit: "최근 제출",
    pendingXpLabel: "승인 대기 XP",
    approvedXpLabel: "승인 완료 XP",
    noPendingXp: "승인 대기 XP 없음",
    growthTitle: "하티 성장 중",
    growthMeta: "Lv. {level} · {stage}",
    nextLevelRemaining: "다음 레벨까지 {xp} XP",
    nextLevelReady: "최고 레벨 달성!",
    rewardChestTitle: "오늘 보상 상자",
    rewardChestLocked: "필수 미션 3개를 완료하면 열려요",
    rewardChestOpen: "상자 오픈 준비 완료. 퇴근 제출 후 승인되면 XP가 반영돼요.",
    rewardChestXp: "오늘 예상 XP",
    trophyAttendance: "출근",
    trophyGoal: "목표",
    trophyPerformance: "성과",
    trophyCheckout: "퇴근",
    trophyApproval: "승인",
    trophyDone: "완료",
    trophyWaiting: "대기",
    todayResultTitle: "오늘 결과",
    todayResultText: "퇴근 제출 후 매니저 승인되면 XP가 공식 반영돼요.",
    submitSuccessTitle: "오늘 멋졌어요!",
    submitSuccessText: "{time} 퇴근 제출 완료. 이제 매니저 승인 후 XP가 반영돼요.",
    stageSeed: "새싹 하티",
    stageActive: "활기 하티",
    stageGrow: "성장 하티",
    stagePro: "프로 하티",
    stageAce: "에이스 하티",
    stageLegend: "레전드 하티",
  };
}

function currentDayQuestRecord(person = selectedStaff(), date = els.date.value) {
  if (!person || !date) {
    return { finalEntry: null, liveEntry: null, personalEntry: null, activeEntry: null };
  }
  if (isFreshTestMode) {
    return { finalEntry: null, liveEntry: null, personalEntry: null, activeEntry: null };
  }
  const sortLatest = (a, b) => selfCheckVersionTime(b) - selfCheckVersionTime(a);
  const selfEntries = (state.selfChecks || [])
    .filter((entry) => entry.staffId === person.id && entry.date === date && entry.status !== "rejected")
    .sort(sortLatest);
  const finalEntry = selfEntries.find((entry) => ["pending", "approved"].includes(entry.status)) || null;
  const liveEntry = selfEntries.find((entry) => entry.status === "live") || null;
  const personalEntry = (state.personalEntries || [])
    .filter((entry) => entry.staffId === person.id && entry.date === date)
    .sort((a, b) => String(b.updatedAt || b.createdAt || "").localeCompare(String(a.updatedAt || a.createdAt || "")))[0] || null;
  return {
    finalEntry,
    liveEntry,
    personalEntry,
    activeEntry: finalEntry || liveEntry || personalEntry || null,
  };
}

function entryNumber(entry, key) {
  const value = Number(entry?.[key] || 0);
  return Number.isFinite(value) ? value : 0;
}

function entryHasCleaning(entry) {
  return Boolean(entry?.cleaningDone || entry?.cleanArea || entry?.cleanStatus);
}

function entryHasGoal(entry) {
  return Boolean(entry?.goalChecked || entry?.goalType);
}

function entryHasPerformance(entry, role) {
  if (!entry) return false;
  if (isKitchenRole(role)) return specialCleanXpFromEntry(entry) > 0 || entryNumber(entry, "hygieneFixPoint") > 0;
  if (isMarketerRole(role)) {
    return ["threadPostPoint", "videoPostPoint", "tomorrowPlanPoint", "marketingReportPoint"]
      .some((key) => entryNumber(entry, key) > 0);
  }
  return ["reviewPoint", "upsellPoint", "membershipPoint", "recommendedMenuPoint"]
    .some((key) => entryNumber(entry, key) > 0);
}

function renderEmployeeTabPanel(tab) {
  if (!els.employeeTabPanel) return;
  const done = questCompletionSnapshot();
  const person = selectedStaff();
  const copy = employeeCopy();
  els.employeeTabPanel.classList.toggle("is-hidden", tab === "home" || tab === "my");
  if (tab === "my") {
    els.employeeTabPanel.innerHTML = "";
    renderEmployeeTabContent(tab, done, person);
    return;
  }
  const panels = {
    home: {
      title: copy.homeTitle,
      text: copy.homeText,
      icon: "home",
    },
    checkin: {
      title: copy.checkinTitle,
      text: els.attendance.checked ? copy.checkinDoneText : copy.checkinText,
      icon: "checkin",
    },
    mission: {
      title: copy.checkoutTitle,
      text: copy.checkoutText,
      icon: "mission",
    },
    performance: {
      title: copy.performanceTitle,
      text: copy.performanceText,
      icon: "performance",
    },
    ranking: {
      title: copy.rankingTitle,
      text: copy.rankingText,
      icon: "ranking",
    },
    my: {
      title: copy.myTitle,
      text: copy.myText,
      icon: "my",
    },
  };
  const panel = panels[tab] || panels.home;
  const activePerson = selectedStaff();
  if (tab === "performance" && isKitchenRole(activePerson?.role)) {
    panel.title = currentLang === "vi" ? "Vệ sinh đặc biệt" : "특수 청소";
    panel.text = currentLang === "vi"
      ? "Chọn khu vực đã vệ sinh và xem lần vệ sinh gần nhất."
      : "청소한 구역을 선택하고 마지막 청소일을 확인해요.";
  }
  if (tab === "performance" && isMarketerRole(activePerson?.role)) {
    panel.title = currentLang === "vi" ? "Marketing" : "마케터 기여도";
    panel.text = currentLang === "vi"
      ? "Ghi bài đăng, video, kế hoạch và báo cáo ngay khi hoàn thành."
      : "포스팅, 영상, 내일 기획, 성과 보고를 완료할 때마다 남겨요.";
  }
  els.employeeTabPanel.dataset.tab = panel.icon;
  els.employeeTabPanel.innerHTML = `
    <div class="phone-tab-icon ${panel.icon}" aria-hidden="true"></div>
    <div>
      <strong>${panel.title}</strong>
      <span>${panel.text}</span>
    </div>
  `;
  renderEmployeeTabContent(tab, done, person);
}

function renderEmployeeTabContent(tab, done, person) {
  if (!els.employeeTabContent) return;
  const copy = employeeCopy();
  const name = person ? visibleStaffName(person, 0) : copy.selectStaffName;
  const role = person ? roleLabel(person.role) : copy.scheduledStaffRole;
  const approvedXp = person ? getApprovedXpForStaff(person.id) : 0;
  const xp = `${approvedXp.toLocaleString()} XP`;
  const level = `Lv. ${levelFromApprovedXp(approvedXp)}`;
  const streakDays = person ? workStreak(person, els.date.value) : 0;
  const streak = currentLang === "vi" ? `${streakDays} ngày` : `${streakDays}일`;
  const progress = done.total ? Math.round((done.completed / done.total) * 100) : 0;
  const weeklyRows = buildWeeklyRows()
    .filter((row) => row.workedDays > 0)
    .sort((a, b) => b.average - a.average || b.workedDays - a.workedDays);
  const myRank = person ? weeklyRows.findIndex((row) => row.id === person.id) + 1 : 0;
  const todayRecord = currentDayQuestRecord(person, els.date.value);
  const todaySubmittedEntry = todayRecord.finalEntry;
  const todayProgressEntry = todayRecord.activeEntry;
  const todayPersonalEntry = todayRecord.personalEntry;
  const recentRows = (state.selfChecks || [])
    .filter((entry) => !person || entry.staffId === person.id)
    .slice(-3)
    .reverse();
  const weekSummary = performancePeriodSummary(person, "week", els.date.value);
  const monthSummary = performancePeriodSummary(person, "month", els.date.value);
  const submittedCheckoutTime = checkoutTime || todaySubmittedEntry?.checkoutTime || todayPersonalEntry?.checkoutTime || "";
  const submittedAttendanceTime = attendanceTime || todayProgressEntry?.attendanceTime || todayPersonalEntry?.attendanceTime || "";
  const submitFeedback = lastSubmitFeedback && person && lastSubmitFeedback.staffId === person.id && lastSubmitFeedback.date === els.date.value
    ? lastSubmitFeedback
    : null;
  const reviewCount = Math.max(readRealtimeCount(els.reviewPoint), entryNumber(todayProgressEntry, "reviewPoint"), entryNumber(todayPersonalEntry, "reviewPoint"));
  const upsellCount = Math.max(readRealtimeCount(els.upsellPoint), entryNumber(todayProgressEntry, "upsellPoint"), entryNumber(todayPersonalEntry, "upsellPoint"));
  const membershipCount = Math.max(readRealtimeCount(els.membershipPoint), entryNumber(todayProgressEntry, "membershipPoint"), entryNumber(todayPersonalEntry, "membershipPoint"));
  const recommendedCount = Math.max(readRealtimeCount(els.recommendedMenuPoint), entryNumber(todayProgressEntry, "recommendedMenuPoint"), entryNumber(todayPersonalEntry, "recommendedMenuPoint"));
  const hygieneFixCount = Math.max(readRealtimeCount(els.hygieneFixPoint), entryNumber(todayProgressEntry, "hygieneFixPoint"), entryNumber(todayPersonalEntry, "hygieneFixPoint"));
  const savedSpecialCleanXp = Math.max(specialCleanXpFromEntry(todayProgressEntry), specialCleanXpFromEntry(todayPersonalEntry));
  const specialCleanXp = Math.max(hygieneFixCount ? (selectedSpecialCleanXp() || 1) : 0, savedSpecialCleanXp);
  const savedSpecialCleanName = specialCleanLabel(todayProgressEntry?.specialCleanArea || todayPersonalEntry?.specialCleanArea || "");
  const specialCleanName = specialCleanLabel() || savedSpecialCleanName || t("hygieneFixPoint");
  const threadPostCount = Math.max(readRealtimeCount(els.threadPostPoint), entryNumber(todayProgressEntry, "threadPostPoint"), entryNumber(todayPersonalEntry, "threadPostPoint"));
  const videoPostCount = Math.max(readRealtimeCount(els.videoPostPoint), entryNumber(todayProgressEntry, "videoPostPoint"), entryNumber(todayPersonalEntry, "videoPostPoint"));
  const tomorrowPlanCount = Math.max(readRealtimeCount(els.tomorrowPlanPoint), entryNumber(todayProgressEntry, "tomorrowPlanPoint"), entryNumber(todayPersonalEntry, "tomorrowPlanPoint"));
  const marketingReportCount = Math.max(readRealtimeCount(els.marketingReportPoint), entryNumber(todayProgressEntry, "marketingReportPoint"), entryNumber(todayPersonalEntry, "marketingReportPoint"));
  const helpCount = readRealtimeCount(els.helpCount);
  const isKitchen = isKitchenRole(person?.role);
  const isMarketer = isMarketerRole(person?.role);
  const activePerformanceRole = isKitchen ? "kitchen" : isMarketer ? "marketer" : "hall";
  const rolePerformanceTiles = performanceItemsForRole(activePerformanceRole)
    .filter((item) => item.enabled !== false)
    .map((item, index) => (
      renderLaunchMissionTile(
        performanceMissionIcon(item, index),
        performanceItemLabel(item),
        currentLang === "vi" ? `Điểm +${item.xp} · 1 lần` : `성과 포인트 +${item.xp} · 1회`,
        item.id,
        performanceCountForItem(item.id, todayProgressEntry, todayPersonalEntry) > 0,
      )
    )).join("");
  const rolePerformanceEmpty = currentLang === "vi"
    ? "Chưa có nhiệm vụ thành tích cho vai trò này."
    : "이 역할에 켜진 성과 미션이 없어요.";
  const rankingCandidate = currentRankingCandidate(person);
  const hallRealtimeXp = currentPerformanceTotalForRole("hall", todayProgressEntry, todayPersonalEntry);
  const kitchenRealtimeXp = currentPerformanceTotalForRole("kitchen", todayProgressEntry, todayPersonalEntry);
  const marketerRealtimeXp = currentPerformanceTotalForRole("marketer", todayProgressEntry, todayPersonalEntry);
  const realtimeXp = isKitchen
    ? Math.max(specialCleanXp, kitchenRealtimeXp)
    : isMarketer
      ? marketerRealtimeXp
      : hallRealtimeXp;
  const hasAttendance = Boolean(submitFeedback || els.attendance?.checked || todayProgressEntry?.attendance || todayPersonalEntry?.worked || submittedAttendanceTime);
  const hasGoal = Boolean(submitFeedback || els.goal?.checked || entryHasGoal(todayProgressEntry) || entryHasGoal(todayPersonalEntry));
  const hasCleaning = Boolean(submitFeedback || (els.cleaning?.checked && els.cleanArea?.value) || entryHasCleaning(todayProgressEntry) || entryHasCleaning(todayPersonalEntry));
  const hasCheckout = Boolean(submitFeedback || submittedCheckoutTime);
  const todayExpectedXp = (hasAttendance ? 10 : 0) + (hasGoal ? 10 : 0) + (hasCleaning ? 10 : 0) + (helpCount ? 10 : 0) + realtimeXp;
  const startActionTitle = hasAttendance && hasGoal ? copy.startDone : hasAttendance ? copy.goalCheck : copy.checkinAction;
  const startActionMeta = hasAttendance && hasGoal ? copy.workStarted : hasAttendance ? copy.goalMeta : copy.firstTodo;
  const checkinActionTarget = submittedCheckoutTime || (hasAttendance && hasGoal) ? "mission" : "checkin";
  const checkinActionText = submittedCheckoutTime
    ? copy.viewCheckout
    : hasAttendance && hasGoal
      ? copy.goCheckout
      : hasAttendance
        ? copy.goalCheck
        : copy.checkinAction;
  const checkinStatusText = submittedCheckoutTime
    ? `${submittedCheckoutTime} ${copy.checkoutRecordedMini}`
    : hasAttendance && hasGoal
      ? copy.checkoutNotYet
      : hasAttendance
        ? copy.checkinNextGoal
        : copy.checkinNextAttendance;
  const latestStatus = todaySubmittedEntry?.status || (todayPersonalEntry ? "approved" : "") || recentRows[0]?.status || ((hasAttendance || hasGoal || realtimeXp > 0) ? "live" : "");
  const latestStatusText = latestStatus ? statusLabel(latestStatus) : copy.noRecordYet;
  const approvalHint = latestStatus === "approved"
    ? copy.approvedHint
    : latestStatus === "pending"
      ? copy.pendingHint
      : latestStatus === "live"
        ? copy.liveHint
        : copy.emptyHint;
  const homeRoomTitle = currentLang === "vi"
    ? (hasCheckout ? "Hôm nay bạn làm rất tốt!" : hasAttendance ? "Hôm nay cố lên nhé!" : "HATI đang chờ bạn")
    : (hasCheckout ? "오늘도 멋졌어요!" : hasAttendance ? "오늘도 화이팅입니다" : "하티가 기다리고 있어요");
  const homeRoomText = currentLang === "vi"
    ? (hasCheckout ? "Ca hôm nay đã được gửi. Hãy chờ quản lý duyệt nhé." : hasAttendance ? "Có kết quả thì ghi ở tab thành tích, cuối ca thì chấm tan ca." : "Bắt đầu bằng tab Vào ca khi đến cửa hàng.")
    : (hasCheckout ? "퇴근 제출이 완료됐어요. 이제 매니저 승인만 기다리면 돼요." : hasAttendance ? "성과가 생기면 성과 탭에 남기고, 마지막엔 퇴근 탭에서 제출해요." : "매장에 도착하면 출근 탭에서 오늘 기록을 시작해요.");
  const homeRoomStatus = latestStatus
    ? approvalHint
    : (currentLang === "vi" ? "Hôm nay chưa có ghi nhận" : "아직 오늘 기록 없음");
  const achievementTrophies = person ? buildAchievementTrophiesForStaff(person.id, els.date.value) : [];
  const growth = levelProgressInfo(approvedXp);
  const stage = hatiStageInfo(growth.level);
  const levelProgressText = growth.nextXp
    ? `${approvedXp.toLocaleString()} / ${growth.nextXp.toLocaleString()} XP`
    : `${approvedXp.toLocaleString()} XP`;
  const growthMeta = copy.growthMeta
    .replace("{level}", growth.level)
    .replace("{stage}", copy[stage.nameKey] || t(stage.nameKey));
  const nextLevelText = growth.remaining > 0
    ? copy.nextLevelRemaining.replace("{xp}", growth.remaining.toLocaleString())
    : copy.nextLevelReady;
  const trophyItems = [
    { done: hasAttendance, label: copy.trophyAttendance, icon: "✓" },
    { done: hasGoal, label: copy.trophyGoal, icon: "◆" },
    { done: realtimeXp > 0, label: copy.trophyPerformance, icon: "★" },
    { done: hasCheckout, label: copy.trophyCheckout, icon: "↗" },
    { done: latestStatus === "approved", label: copy.trophyApproval, icon: "♛" },
  ];
  const trophyStrip = `
    <div class="trophy-strip" aria-label="${escapeHtml(copy.todayResultTitle)}">
      ${trophyItems.map((item) => `
        <span class="${item.done ? "is-unlocked" : ""}">
          <b>${item.icon}</b>
          <strong>${escapeHtml(item.label)}</strong>
          <small>${item.done ? copy.trophyDone : copy.trophyWaiting}</small>
        </span>
      `).join("")}
    </div>
  `;
  const growthCard = `
    <div class="hati-growth-card">
      <div class="hati-growth-avatar hati-stage-${stage.asset}" aria-hidden="true"></div>
      <div class="hati-growth-copy">
        <span class="mini-label">${copy.growthTitle}</span>
        <strong>${growthMeta}</strong>
        <small>${nextLevelText}</small>
        <div class="growth-meter" aria-hidden="true"><b style="width: ${growth.percent}%"></b></div>
      </div>
    </div>
  `;
  const todayResultCard = `
    <div class="today-result-card">
      <div>
        <span class="mini-label">${copy.todayResultTitle}</span>
        <strong>${todayExpectedXp.toLocaleString()} XP</strong>
        <small>${copy.todayResultText}</small>
      </div>
      <div class="today-result-progress" aria-hidden="true"><b style="width: ${progress}%"></b></div>
    </div>
  `;
  const submitSuccessCard = submitFeedback ? `
    <div class="submit-success-card" role="status" aria-live="polite">
      <div class="submit-success-icon" aria-hidden="true">✓</div>
      <div>
        <strong>${copy.submitSuccessTitle}</strong>
        <span>${copy.submitSuccessText.replace("{time}", escapeHtml(submitFeedback.time || submittedCheckoutTime || copy.justNow))}</span>
      </div>
    </div>
  ` : "";

  const recentList = recentRows.length ? recentRows.map((entry) => `
    <li>
      <strong>${entry.date}</strong>
      <span>${statusLabel(entry.status)}</span>
    </li>
  `).join("") : `<li class="is-empty">${copy.noRecentMini}</li>`;
  const homeQuickMissions = renderHomeQuickMissions({
    copy,
    hasAttendance,
    hasGoal,
    hasCheckout,
    realtimeXp,
  });
  const homeTeamQuest = renderHomeTeamQuest(person);
  const homeSocialFeed = renderHomeSocialFeed(person);
  const checkinMoodCard = renderCheckinMoodCard();
  const checkinGoalMapCard = renderCheckinGoalMapCard(hasGoal);
  const checkinReadyCard = renderCheckinReadyCard(hasAttendance, hasGoal);
  const checkinNeedsMood = !hasAttendance && !checkinMood;
  const checkinActionLabel = checkinNeedsMood ? copy.pickMoodFirst : copy.checkinAction;
  const checkinActionHelp = checkinNeedsMood ? copy.pickMoodHelp : checkinStatusText;

  const templates = {
    home: `
      <section class="home-hero-dashboard" aria-label="${escapeHtml(copy.todayHome)}">
        <strong class="home-hero-kicker">${currentLang === "vi" ? "Hôm nay cùng LEVO!" : "오늘도 LEVO와 함께!"}</strong>
        <div class="home-hero-card">
          <div class="home-hero-greeting">
            <div>
              <strong>${currentLang === "vi" ? `Xin chào, ${escapeHtml(name)}!` : `안녕하세요, ${escapeHtml(name)}!`} 👋</strong>
              <span>${currentLang === "vi" ? "Hãy hoàn thành nhiệm vụ hôm nay!" : "오늘도 멋진 하루 보내세요!"}</span>
            </div>
            <button type="button" class="home-hero-bell" data-jump-tab="my" aria-label="${currentLang === "vi" ? "Thông báo" : "알림"}">
              🔔
            </button>
          </div>
          <div class="home-hero-main">
            <div class="home-level-ring" style="--level-progress: ${growth.percent}%">
              <div>
                <strong>${level}</strong>
                <span>${escapeHtml(levelProgressText)}</span>
              </div>
            </div>
            <div class="home-hero-hati hati-stage-${stage.asset}" aria-hidden="true"></div>
          </div>
          <div class="home-hero-stats">
            <button type="button" data-jump-tab="my">
              <span>${currentLang === "vi" ? "Chuỗi đi làm" : "연속 출근"}</span>
              <strong>${streak}</strong>
              <b>🔥</b>
            </button>
            <button type="button" data-jump-tab="ranking">
              <span>${currentLang === "vi" ? "Xếp hạng tuần" : "이번주 랭킹"}</span>
              <strong>${myRank ? `${copy.rankShort}${myRank}${copy.rankSuffix}` : copy.rankingWaiting}</strong>
              <b>🏆</b>
            </button>
          </div>
          <button class="home-checkin-cta" type="button" data-checkin-action ${hasAttendance && hasGoal ? "disabled" : ""}>
            ${hasAttendance && hasGoal ? copy.startDone : hasAttendance ? copy.goalCheck : copy.checkinAction}
          </button>
          <small class="home-hero-footer">${currentLang === "vi" ? "Hôm nay cùng bắt đầu thật vui nhé! 💚" : "오늘도 힘차게 시작해요! 💚"}</small>
        </div>
        ${homeQuickMissions}
        ${homeTeamQuest}
        ${homeSocialFeed}
      </section>
    `,
    checkin: `
      ${checkinMoodCard}
      ${!hasAttendance ? `
        <div class="checkin-page-card">
          <div class="checkin-page-icon" aria-hidden="true">✓</div>
          <span class="mini-label">${copy.firstTodo}</span>
          <strong>${copy.checkinPageReadyTitle}</strong>
          <p>${copy.checkinPageReadyText}</p>
          <button class="mini-tab-jump primary" type="button" data-checkin-action ${checkinNeedsMood ? "disabled" : ""}>${checkinActionLabel}</button>
          <small>${checkinActionHelp}</small>
        </div>
      ` : checkinGoalMapCard}
      ${checkinReadyCard}
    `,
    mission: `
      <section class="launch-style-page checkout">
        <div class="launch-page-hero">
          <div class="mini-hati sleepy" aria-hidden="true"></div>
          <div>
            <strong>${currentLang === "vi" ? "Nhiệm vụ kết ca" : "마감 퀘스트"}</strong>
            <span>${currentLang === "vi" ? "Chỉ cần để lại trạng thái cuối ca thật nhẹ nhàng." : "퇴근 전 마지막 상태만 가볍게 남겨요."}</span>
          </div>
        </div>
        <div class="launch-card checkout-card">
          <div class="launch-card-head">
            <div>
              <strong>${currentLang === "vi" ? "Kiểm tra trước khi về" : "퇴근 전 점검"}</strong>
              <span>${currentLang === "vi" ? "Không phải báo cáo lỗi, chỉ là xác nhận trạng thái." : "문제 보고가 아니라 마감 상태 확인이에요."}</span>
            </div>
            <b>${currentLang === "vi" ? "Điểm +1" : "성과 포인트 +1"}</b>
          </div>
          <div class="launch-check-list">
            <label><input type="checkbox" data-checkout-guard ${hasCleaning ? "checked" : ""} /> ${currentLang === "vi" ? "Khu vực của tôi không có vấn đề" : "내 구역 마감 상태 이상 없음"}</label>
            <label><input type="checkbox" data-checkout-guard ${hasCleaning ? "checked" : ""} /> ${currentLang === "vi" ? "Đã kiểm tra đơn hàng/khách" : "고객 응대/주문 누락 확인"}</label>
            <label><input type="checkbox" data-checkout-guard /> ${currentLang === "vi" ? "Có nội dung cần báo quản lý" : "매니저에게 전달할 내용 있음"}</label>
          </div>
          <button class="home-checkin-cta" type="button" data-submit-checkout ${submittedCheckoutTime ? "disabled" : ""}>
            ${submittedCheckoutTime ? copy.checkoutDone : copy.goCheckout}
          </button>
          <p class="launch-note">${currentLang === "vi" ? "Sau khi gửi, quản lý chỉ duyệt điểm thành tích. LEVO XP tách riêng." : "제출 후 매니저가 성과 포인트만 리뷰합니다. LEVO XP와는 별도예요."}</p>
        </div>
        <div class="launch-status-card">
          <div>
            <small>${currentLang === "vi" ? "Trạng thái hôm nay" : "오늘 상태"}</small>
            <strong>${submittedCheckoutTime ? (currentLang === "vi" ? "Chờ quản lý duyệt" : "매니저 리뷰 대기") : (currentLang === "vi" ? "Chờ gửi kết ca" : "마감 제출 대기")}</strong>
          </div>
          <b>${submittedCheckoutTime ? "1 / 1" : "0 / 1"}</b>
          <span><i style="width:${submittedCheckoutTime ? 100 : 0}%"></i></span>
        </div>
      </section>
    `,
    performance: `
      <section class="launch-style-page performance">
        <div class="launch-page-hero">
          <div class="mini-hati success" aria-hidden="true"></div>
          <div>
            <strong>${currentLang === "vi" ? "Nhiệm vụ tăng trưởng" : "성장 미션"}</strong>
            <span>${currentLang === "vi" ? "Nhiệm vụ chỉ ghi điểm thành tích, không cộng LEVO XP." : "성과 미션은 성과 포인트만 기록됩니다. LEVO XP와는 상관없어요."}</span>
          </div>
        </div>
        <div class="launch-mission-grid">
          ${rolePerformanceTiles || `<div class="launch-empty-state">${rolePerformanceEmpty}</div>`}
        </div>
        ${rankingCandidate ? `<div class="launch-status-card ranking-candidate-card">
          <div>
            <small>${currentLang === "vi" ? "Trạng thái ứng viên" : "후보 상태"}</small>
            <strong>${escapeHtml(rankingCandidate.title)}</strong>
            <em>${escapeHtml(rankingCandidate.cheer)}</em>
            <span class="ranking-candidate-progress" aria-hidden="true"><i style="width:${rankingCandidate.progress}%"></i></span>
            <span class="ranking-candidate-hint">${escapeHtml(rankingCandidate.gapText)}</span>
          </div>
          <b>${escapeHtml(rankingCandidate.valueText)}</b>
          <div class="ranking-candidate-stats">
            <span><small>${currentLang === "vi" ? "Hạng của tôi" : "내 순위"}</small><strong>${escapeHtml(rankingCandidate.rankText)}</strong></span>
            <span><small>${currentLang === "vi" ? "Cúp" : "트로피"}</small><strong>${escapeHtml(rankingCandidate.trophyText)}</strong></span>
          </div>
        </div>` : ""}
      </section>
    `,
    ranking: `
      ${renderRankingTeamChallenge()}
      ${renderEmployeePerformanceRankings(copy)}
    `,
    my: `
      ${renderMyProfileCard({ person, name, role, xp, level, streak, myRank, copy, growthCard })}
      ${renderMyAttendanceCard(person, streakDays, copy)}
      ${renderAchievementGallery(achievementTrophies)}
      <div class="status-guide-card">
        <strong>${copy.todayStatus}</strong>
        <span>${latestStatusText}</span>
        <small>${approvalHint}</small>
      </div>
      <div class="mini-recent-card">
        <strong>${copy.recentSubmit}</strong>
        <ol>${recentList}</ol>
      </div>
    `,
  };

  els.employeeTabContent.innerHTML = templates[tab] || templates.home;
}

function renderLaunchMissionTile(icon, title, meta, fieldId, done) {
  return `
    <button class="launch-mission-tile ${done ? "is-complete" : ""}" type="button" data-performance-mission="${escapeHtml(fieldId)}" ${done ? "disabled" : ""}>
      <span class="launch-mission-icon" aria-hidden="true">${icon}</span>
      <span class="launch-mission-copy">
        <strong>${escapeHtml(title)}</strong>
        <small>${escapeHtml(meta)}</small>
      </span>
      <b>${done ? (currentLang === "vi" ? "Đã xong ✓" : "완료됨 ✓") : (currentLang === "vi" ? "Hoàn thành" : "미션 완료")}</b>
    </button>
  `;
}

function performanceMissionIcon(item, index = 0) {
  if (item?.id?.includes("review")) return "⭐";
  if (item?.id?.includes("team") || item?.id?.includes("help")) return "💚";
  if (item?.id?.includes("sales") || item?.id?.includes("upsell")) return "🥤";
  if (item?.id?.includes("menu") || item?.id?.includes("recommended")) return "🍜";
  return ["⭐", "💚", "🥤", "🍜", "✨", "🏅"][index % 6];
}

function performanceCountForItem(itemId, ...entries) {
  const liveInput = document.getElementById(itemId);
  const liveCount = liveInput ? readRealtimeCount(liveInput) : 0;
  const savedCount = entries.reduce((max, entry) => Math.max(max, entryPerformanceReportCount(entry, itemId), entryNumber(entry, itemId)), 0);
  return Math.max(liveCount, savedCount);
}

function currentPerformanceTotalForRole(role, ...entries) {
  return performanceItemsForRole(role).reduce((sum, item) => (
    sum + performanceCountForItem(item.id, ...entries) * Number(item.xp || 1)
  ), 0);
}

function entryPerformanceReportCount(entry, itemId) {
  const reports = Array.isArray(entry?.performanceReports) ? entry.performanceReports : [];
  return reports
    .filter((report) => report.id === itemId)
    .reduce((sum, report) => sum + Number(report.count || 0), 0);
}

function renderHomeMainQuestCard({
  hasAttendance,
  hasGoal,
  hasCheckout,
  isKitchen,
  isMarketer,
  realtimeXp,
  specialCleanName,
}) {
  const vi = currentLang === "vi";
  let quest = {
    icon: "🎯",
    title: vi ? "Nhiệm vụ chính hôm nay" : "오늘의 메인 퀘스트",
    text: vi ? "Bấm chấm công để mở nhiệm vụ hôm nay!" : "출근 체크로 오늘 모험을 시작해요!",
    reward: "+10 XP",
    action: vi ? "Thử ngay 🚀" : "도전하기 🚀",
    attrs: "data-checkin-action",
  };
  if (hasCheckout) {
    quest = {
      icon: "🎉",
      title: vi ? "Nhiệm vụ hôm nay đã clear!" : "오늘 미션 클리어!",
      text: vi ? "LEVO đang rất vui. Vào My để xem trạng thái duyệt." : "LEVO가 신나 있어요. 마이에서 승인 상태를 볼 수 있어요.",
      reward: vi ? "Chờ duyệt" : "승인 대기",
      action: vi ? "Xem My" : "마이 보기",
      attrs: 'data-jump-tab="my"',
    };
  } else if (hasAttendance && !hasGoal) {
    quest = {
      icon: "🗺️",
      title: vi ? "Mở bản đồ mục tiêu" : "목표 맵 열기",
      text: vi ? "Xem món cần tập trung và điểm phục vụ hôm nay." : "오늘 집중할 추천 메뉴와 서비스 포인트를 확인해요.",
      reward: "+10 XP",
      action: vi ? "Mở bản đồ" : "맵 열기",
      attrs: 'data-jump-tab="checkin"',
    };
  } else if (hasAttendance && isKitchen) {
    quest = {
      icon: "🧹",
      title: vi ? "Nhiệm vụ sạch sẽ" : "클린 미션",
      text: vi ? "Clear một khu vực đặc biệt để nhận huy hiệu." : `${escapeHtml(specialCleanName || "특수 구역")} 클리어에 도전해요.`,
      reward: realtimeXp > 0 ? `+${Number(realtimeXp).toLocaleString()} XP` : "+10 XP",
      action: vi ? "Nhận nhiệm vụ" : "미션 받기",
      attrs: 'data-jump-tab="performance"',
    };
  } else if (hasAttendance && isMarketer) {
    quest = {
      icon: "📣",
      title: vi ? "Nhiệm vụ nội dung" : "콘텐츠 퀘스트",
      text: vi ? "Hoàn thành bài đăng, video hoặc báo cáo nhỏ." : "포스팅, 영상, 보고 중 하나를 배지처럼 모아요.",
      reward: realtimeXp > 0 ? `+${Number(realtimeXp).toLocaleString()} XP` : "+10 XP",
      action: vi ? "Nhận huy hiệu" : "배지 획득",
      attrs: 'data-jump-tab="performance"',
    };
  } else if (hasAttendance) {
    quest = {
      icon: "⭐",
      title: vi ? "Khách đã cười!" : "고객 경험 성장",
      text: vi ? "Review, gợi ý thành công và khoảnh khắc tốt đều là huy hiệu." : "리뷰, 추천 성공, 고객이 웃은 순간을 배지처럼 모아요.",
      reward: realtimeXp > 0 ? `+${Number(realtimeXp).toLocaleString()} XP` : "+10 XP",
      action: vi ? "Nhận huy hiệu" : "배지 획득",
      attrs: 'data-jump-tab="performance"',
    };
  }
  return `
    <button class="home-main-quest" type="button" ${quest.attrs}>
      <span class="home-main-quest-icon" aria-hidden="true">${quest.icon}</span>
      <span class="home-main-quest-copy">
        <small>${vi ? "MAIN QUEST" : "MAIN QUEST"}</small>
        <strong>${quest.title}</strong>
        <em>${quest.text}</em>
      </span>
      <span class="home-quest-reward">${quest.reward}</span>
      <b>${quest.action}</b>
    </button>
  `;
}

function renderHomeQuickMissions({ hasAttendance, hasGoal, hasCheckout, realtimeXp }) {
  const vi = currentLang === "vi";
  const items = [
    {
      done: hasAttendance,
      icon: "🚪",
      label: vi ? "Vào ca" : "입장",
      meta: vi ? "Mở ngày chơi" : "오늘 모험 시작",
      tab: "checkin",
    },
    {
      done: hasGoal,
      icon: "🎯",
      label: vi ? "Bản đồ" : "목표 맵",
      meta: vi ? "Điểm tập trung" : "오늘 집중 포인트",
      tab: "checkin",
    },
    {
      done: Number(realtimeXp || 0) > 0,
      icon: "✨",
      label: vi ? "Huy hiệu" : "배지",
      meta: vi ? "Khoảnh khắc tốt" : "좋은 순간 기록",
      tab: "performance",
    },
    {
      done: hasCheckout,
      icon: "🛡️",
      label: vi ? "Kết ca" : "마감 가드",
      meta: vi ? "Hoàn thành ngày" : "오늘 마무리",
      tab: "mission",
    },
  ];
  return `
    <div class="home-quick-missions" aria-label="${vi ? "Nhiệm vụ nhanh" : "빠른 퀘스트"}">
      ${items.map((item) => `
        <button class="home-quick-card ${item.done ? "is-done" : ""}" type="button" data-jump-tab="${item.tab}">
          <span>${item.done ? "✅" : item.icon}</span>
          <strong>${item.label}</strong>
          <small>${item.done ? (vi ? "Clear" : "완료") : item.meta}</small>
        </button>
      `).join("")}
    </div>
  `;
}

function renderHomeTeamQuest(person) {
  const vi = currentLang === "vi";
  const teamConfig = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);
  if (!teamConfig.enabled) return "";
  const challenge = currentTeamChallenge();
  const reviewCount = Number(challenge.reviewCount || 0);
  const reviewTarget = teamConfig.primaryTarget;
  const claimCount = Number(challenge.claimCount ?? challenge.claimZeroDays ?? 0);
  const percent = Math.min(100, Math.max(reviewCount ? 8 : 3, Math.round((reviewCount / Math.max(reviewTarget, 1)) * 100)));
  const message = challenge.memo || (vi ? "Cố thêm chút nữa nhé!" : "조금만 더 힘내요!");
  return `
    <button class="home-team-quest home-team-challenge" type="button" data-jump-tab="ranking">
      <span class="home-team-orb" aria-hidden="true">💚</span>
      <span class="home-team-copy">
        <small>${vi ? "WEEKLY TEAM CHALLENGE" : "이번주 팀 챌린지"}</small>
        <strong>${escapeHtml(vi ? "Cùng đội phát triển" : `${teamConfig.title} 💚`)}</strong>
        <em>${vi ? "Mọi người cùng clear mục tiêu tuần này" : "다 같이 이번주 목표를 클리어해요"}</em>
      </span>
      <span class="home-team-score">${formatScoreLikeTeamChallenge(challenge)}</span>
      <span class="home-team-divider" aria-hidden="true"></span>
      <span class="home-team-metric"><b>⭐</b><strong>${escapeHtml(vi ? "Review" : teamConfig.primaryLabel)}</strong><em>${reviewCount.toLocaleString()} / ${reviewTarget.toLocaleString()}</em></span>
      <span class="home-team-metric"><b>🔥</b><strong>${escapeHtml(vi ? "Claim" : teamConfig.secondaryLabel)}</strong><em>${claimCount.toLocaleString()}${vi ? " lần" : "건"}</em></span>
      <span class="home-team-progress" aria-hidden="true"><i style="width: ${percent}%"></i></span>
      <span class="home-team-divider" aria-hidden="true"></span>
      <span class="home-team-cheer">“${escapeHtml(message)}”</span>
    </button>
  `;
}

function currentTeamChallenge() {
  const teamConfig = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);
  if (!teamConfig.enabled) {
    return { reviewCount: 0, reviewTarget: teamConfig.primaryTarget, claimCount: 0, memo: "" };
  }
  const today = els.date?.value || toInputDate(new Date());
  const range = periodDateRange("week", today);
  const entries = (state.teamEntries || [])
    .filter((entry) => entry.date >= range.start && entry.date <= range.end)
    .filter((entry) => entry.team === "store" || entry.reviewCount !== undefined)
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")) || String(b.id || "").localeCompare(String(a.id || "")));
  if (entries.length) {
    const latest = entries[0];
    return {
      ...latest,
      reviewCount: entries.reduce((sum, entry) => sum + Number(entry.reviewCount || 0), 0),
      reviewTarget: teamConfig.primaryTarget,
      primaryLabel: teamConfig.primaryLabel,
      claimCount: entries.reduce((sum, entry) => sum + Number(entry.claimCount ?? entry.claimZeroDays ?? 0), 0),
      secondaryLabel: teamConfig.secondaryLabel,
      memo: latest.memo || (currentLang === "vi" ? "Cố thêm chút nữa nhé!" : "조금만 더 힘내요!"),
    };
  }
  return {
    reviewCount: 0,
    reviewTarget: teamConfig.primaryTarget,
    primaryLabel: teamConfig.primaryLabel,
    claimCount: 0,
    secondaryLabel: teamConfig.secondaryLabel,
    memo: currentLang === "vi" ? "Cố thêm chút nữa nhé!" : "조금만 더 힘내요!",
  };
}

function formatScoreLikeTeamChallenge(challenge) {
  const reviewCount = Number(challenge.reviewCount || 0);
  const reviewTarget = Number(challenge.reviewTarget || normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings).primaryTarget);
  return `${reviewCount.toLocaleString()} / ${reviewTarget.toLocaleString()}`;
}

function renderRankingTeamChallenge() {
  const vi = currentLang === "vi";
  const teamConfig = normalizeTeamChallengeSettings(state.storeSettings?.teamChallengeSettings);
  if (!teamConfig.enabled) return "";
  const challenge = currentTeamChallenge();
  const reviewCount = Number(challenge.reviewCount || 0);
  const reviewTarget = teamConfig.primaryTarget;
  const claimCount = Number(challenge.claimCount ?? challenge.claimZeroDays ?? 0);
  const percent = Math.min(100, Math.max(reviewCount ? 8 : 3, Math.round((reviewCount / Math.max(reviewTarget, 1)) * 100)));
  const remaining = Math.max(0, reviewTarget - reviewCount);
  const message = challenge.memo || (remaining > 0
    ? (vi ? `Còn ${remaining.toLocaleString()} review nữa!` : `${remaining.toLocaleString()}개만 더 모으면 클리어!`)
    : (vi ? "Team đã clear mục tiêu tuần này!" : "이번주 팀 목표 클리어!"));
  return `
    <section class="ranking-team-challenge" aria-label="${vi ? "Điểm thử thách đội tuần này" : "이번주 팀 챌린지 점수"}">
      <div class="ranking-team-head">
        <span class="home-team-orb" aria-hidden="true">💚</span>
        <div>
          <small>${vi ? "WEEKLY TEAM QUEST" : "WEEKLY TEAM QUEST"}</small>
          <strong>${escapeHtml(vi ? "Điểm thử thách đội" : teamConfig.title)}</strong>
          <em>${vi ? "Từ thứ hai đến chủ nhật" : "월요일부터 일요일까지 집계"}</em>
        </div>
        <b>${formatScoreLikeTeamChallenge(challenge)}</b>
      </div>
      <div class="ranking-team-metrics">
        <span><i aria-hidden="true">⭐</i><strong>${escapeHtml(vi ? "Review" : teamConfig.primaryLabel)}</strong><em>${reviewCount.toLocaleString()} / ${reviewTarget.toLocaleString()}</em></span>
        <span><i aria-hidden="true">🔥</i><strong>${escapeHtml(vi ? "Claim" : teamConfig.secondaryLabel)}</strong><em>${claimCount.toLocaleString()}${vi ? " lần" : "건"}</em></span>
      </div>
      <div class="home-team-progress" aria-hidden="true"><i style="width: ${percent}%"></i></div>
      <p>“${escapeHtml(message)}”</p>
    </section>
  `;
}

function renderHomeSocialFeed(person) {
  const vi = currentLang === "vi";
  const feed = [];
  weeklyActivityEntries().slice().reverse().some((entry, index) => {
    const staff = state.staff.find((item) => item.id === entry.staffId) || person;
    const name = staff ? visibleStaffName(staff, index) : (vi ? "LEVO" : "LEVO");
    const praised = entry.helpType ? state.staff.find((item) => item.id === entry.helpType) : null;
    if (praised) {
      feed.push(vi
        ? `💚 ${escapeHtml(name)} đã khen ${escapeHtml(visibleStaffName(praised, index + 1))}!`
        : `💚 ${escapeHtml(name)}님이 ${escapeHtml(visibleStaffName(praised, index + 1))}님을 칭찬했어요!`);
    } else if (specialCleanCountFromEntry(entry) > 0) {
      feed.push(vi ? `🧹 ${escapeHtml(name)} đã clear nhiệm vụ vệ sinh!` : `🧹 ${escapeHtml(name)}님이 클린 미션을 클리어했어요!`);
    } else if (Number(entry.reviewPoint || 0) > 0) {
      feed.push(vi ? `⭐ ${escapeHtml(name)} nhận huy hiệu khách vui!` : `⭐ ${escapeHtml(name)}님이 고객 미소 배지를 획득했어요!`);
    } else if (Number(entry.upsellPoint || 0) + Number(entry.recommendedMenuPoint || 0) > 0) {
      feed.push(vi ? `⚡ ${escapeHtml(name)} gợi ý thành công!` : `⚡ ${escapeHtml(name)}님이 추천 성공 배지를 얻었어요!`);
    } else if (entry.attendance) {
      feed.push(vi ? `🔥 ${escapeHtml(name)} bắt đầu phiêu lưu hôm nay!` : `🔥 ${escapeHtml(name)}님이 오늘 모험을 시작했어요!`);
    }
    return feed.length >= 3;
  });
  while (feed.length < 3) {
    feed.push(vi ? "💚 LEVO đang chờ khoảnh khắc tốt tiếp theo." : "💚 LEVO가 다음 좋은 순간을 기다리고 있어요.");
  }
  return `
    <div class="home-social-feed">
      <div class="home-social-head">
        <strong>${vi ? "Feed tăng trưởng" : "성장 피드"}</strong>
        <span>${vi ? "Đội đang sống động" : "팀이 움직이는 중"}</span>
      </div>
      ${feed.slice(0, 3).map((item) => `<p>${item}</p>`).join("")}
    </div>
  `;
}

function renderHomeSummaryCard({ label, xp, workedDays, pendingXp, copy }) {
  const daysText = currentLang === "vi"
    ? `${workedDays.toLocaleString()} ngày`
    : `${workedDays.toLocaleString()}일`;
  const pendingText = pendingXp > 0
    ? `${copy.pendingXpLabel} ${pendingXp.toLocaleString()} XP`
    : (currentLang === "vi" ? "Không có XP chờ duyệt" : "승인 대기 없음");
  return `
    <button class="home-summary-card" type="button" data-jump-tab="my">
      <span>${escapeHtml(label)}</span>
      <strong>${xp.toLocaleString()} XP</strong>
      <small>${daysText} · ${pendingText}</small>
      <em>${currentLang === "vi" ? "Chi tiết" : "자세히"}</em>
    </button>
  `;
}

function homeWeeklyPerformanceItems(person) {
  if (!person) return [];
  const staffId = person.id;
  const doneText = (value) => currentLang === "vi"
    ? `Hoàn thành ${Number(value || 0).toLocaleString()} lần trong 7 ngày gần đây!`
    : `최근 7일간 ${Number(value || 0).toLocaleString()}회 완료!`;
  if (isKitchenRole(person.role)) {
    const value = ownWeeklySpecialCleanCount(staffId);
    return [
      {
        label: currentLang === "vi" ? "Nhiệm vụ vệ sinh" : "클린 미션",
        icon: "🧹",
        detail: doneText(value),
        metricLabel: currentLang === "vi" ? "điểm vệ sinh" : "위생 포인트",
        value,
      },
    ];
  }
  if (isMarketerRole(person.role)) {
    return [
      { label: t("threadPostPoint"), icon: "🧵", value: ownWeeklyCount(staffId, "threadPostPoint") },
      { label: t("videoPostPoint"), icon: "🎬", value: ownWeeklyCount(staffId, "videoPostPoint") },
      { label: t("tomorrowPlanPoint"), icon: "🗓️", value: ownWeeklyCount(staffId, "tomorrowPlanPoint") },
      { label: t("marketingReportPoint"), icon: "📈", value: ownWeeklyCount(staffId, "marketingReportPoint") },
    ].map((item) => ({ ...item, detail: doneText(item.value) }));
  }
  const hallItems = [
    { label: currentLang === "vi" ? "Nhiệm vụ review" : "리뷰 미션", icon: "⭐", value: ownWeeklyCount(staffId, "reviewPoint") },
    { label: currentLang === "vi" ? "Nhiệm vụ upsell" : "업셀 미션", icon: "⚡", value: ownWeeklyCount(staffId, "upsellPoint") },
    { label: currentLang === "vi" ? "Membership" : "멤버십 미션", icon: "💚", value: ownWeeklyCount(staffId, "membershipPoint") },
    { label: currentLang === "vi" ? "Món đề xuất" : "추천메뉴 미션", icon: "🍜", value: ownWeeklyCount(staffId, "recommendedMenuPoint") },
  ];
  return hallItems.map((item) => ({ ...item, detail: doneText(item.value) }));
}

function homeWeeklyPerformanceMetric(item) {
  const value = Number(item.value || 0).toLocaleString();
  if (item.metricLabel) return currentLang === "vi" ? `+${value} ${item.metricLabel}` : `+${value} ${item.metricLabel}`;
  return currentLang === "vi" ? `+${value} đạt được` : `+${value} 획득`;
}

function renderHomeWeeklyPerformanceCards(person, copy) {
  const items = homeWeeklyPerformanceItems(person);
  if (!items.length) {
    return `
      <div class="home-performance-summary-head">
        <strong>${currentLang === "vi" ? "Thành tích 7 ngày gần đây" : "최근 1주일 성과"}</strong>
        <span>${copy.emptyHint}</span>
      </div>
    `;
  }
  return `
    <div class="home-performance-summary-head">
      <strong>${currentLang === "vi" ? "Thành tích 7 ngày gần đây" : "최근 1주일 성과"}</strong>
      <span>${escapeHtml(roleLabel(person.role))}</span>
    </div>
    ${items.map((item) => `
      <button class="home-summary-card weekly-performance" type="button" data-jump-tab="performance">
        <span>${escapeHtml(item.icon || "✨")} ${escapeHtml(item.label)}</span>
        <strong>${escapeHtml(item.detail || "")}</strong>
        <small>${escapeHtml(homeWeeklyPerformanceMetric(item))}</small>
        <em>${currentLang === "vi" ? "Ghi" : "기록"}</em>
      </button>
    `).join("")}
  `;
}

function achievementTrophyTypes() {
  return [
    {
      key: "praise",
      icon: "💬",
      ko: "칭찬왕",
      vi: "Vua khen",
      value: (personEntries, allEntries, person) => allEntries.filter((entry) => entry.helpType === person.id).length,
    },
    {
      key: "review",
      icon: "⭐",
      ko: "리뷰왕",
      vi: "Vua review",
      value: (personEntries) => personEntries.reduce((sum, entry) => (
        sum + Number(entry.reviewPoint || 0) + Number(entry.membershipPoint || 0)
      ), 0),
    },
    {
      key: "upsell",
      icon: "⚡",
      ko: "업셀왕",
      vi: "Vua upsell",
      value: (personEntries) => personEntries.reduce((sum, entry) => (
        sum + Number(entry.upsellPoint || 0) + Number(entry.recommendedMenuPoint || 0)
      ), 0),
    },
    {
      key: "cleaning",
      icon: "✨",
      ko: "청소왕",
      vi: "Vua vệ sinh",
      value: (personEntries) => personEntries.reduce((sum, entry) => sum + specialCleanCountFromEntry(entry), 0),
      eligible: (person) => isKitchenRole(person.role),
    },
  ];
}

function buildAchievementTrophiesForStaff(staffId, targetDate) {
  if (!staffId) return [];
  const openMonth = toMonthInput(new Date());
  const months = [...new Set((state.personalEntries || [])
    .map((entry) => (entry.date || "").slice(0, 7))
    .filter((month) => month && month < openMonth))]
    .sort((a, b) => b.localeCompare(a));
  const people = staff.filter((person) => !isManagerRole(person.role));
  const trophies = [];

  months.forEach((month) => {
    const monthRows = monthEntries(state.personalEntries || [], month).filter((entry) => Number(entry.worked || 0));
    achievementTrophyTypes().forEach((type) => {
      const candidates = people
        .filter((person) => !type.eligible || type.eligible(person))
        .map((person) => {
          const personEntries = monthRows.filter((entry) => entry.staffId === person.id);
          return {
            id: person.id,
            name: person.name,
            value: Number(type.value(personEntries, monthRows, person) || 0),
          };
        })
        .filter((row) => row.value > 0)
        .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name));
      const winnerValue = candidates[0]?.value || 0;
      const mine = candidates.find((row) => row.id === staffId && row.value === winnerValue);
      if (!mine) return;
      trophies.push({
        key: type.key,
        icon: type.icon,
        title: currentLang === "vi" ? type.vi : type.ko,
        month,
        monthLabel: formatAchievementMonth(month),
        value: mine.value,
      });
    });
  });

  return trophies;
}

function formatAchievementMonth(month) {
  const [, monthPart] = String(month).split("-");
  const monthNumber = Number(monthPart || 0);
  if (currentLang === "vi") return `Tháng ${monthNumber}`;
  return `${monthNumber}월`;
}

function trophyValueUnit(key) {
  if (currentLang === "vi") return key === "praise" ? "lần" : "lần";
  return key === "praise" ? "회" : "건";
}

function renderHomeTrophyShowcase(trophies) {
  const visible = trophies.slice(0, 4);
  if (!visible.length) {
    const emptyText = currentLang === "vi" ? "Chưa có cúp" : "전시 대기";
    return `
      <button class="home-trophy-dock is-empty" type="button" data-jump-tab="my" aria-label="${escapeHtml(emptyText)}">
        <span>
          <b>🏆</b>
          <small>${escapeHtml(emptyText)}</small>
        </span>
      </button>
    `;
  }
  return `
    <button class="home-trophy-dock" type="button" data-jump-tab="my" aria-label="${currentLang === "vi" ? "Cúp đã đạt" : "획득 트로피"}">
      ${visible.map((item) => `
        <span class="achievement-trophy ${escapeHtml(item.key)}">
          <b>${item.icon}</b>
          <small>${escapeHtml(item.monthLabel)} ${escapeHtml(item.title)}</small>
        </span>
      `).join("")}
    </button>
  `;
}

function renderAchievementGallery(trophies) {
  const title = currentLang === "vi" ? "Tủ cúp thành tích" : "업적 트로피 진열장";
  const meta = currentLang === "vi" ? "Cúp tháng trước trở về trước được lưu tại đây." : "지난달까지 확정된 월간 1등 업적만 저장해요.";
  const empty = currentLang === "vi" ? "Chưa có cúp. Sau khi tháng kết thúc, hạng 1 sẽ được lưu." : "아직 확정된 트로피가 없어요. 월이 끝난 뒤 1등이면 저장돼요.";
  return `
    <section class="achievement-gallery">
      <div class="achievement-gallery-head">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <span>${escapeHtml(meta)}</span>
        </div>
        <em>${trophies.length}${currentLang === "vi" ? " cúp" : "개"}</em>
      </div>
      ${trophies.length ? `
        <div class="achievement-trophy-grid">
          ${trophies.map((item) => `
            <article class="achievement-card ${escapeHtml(item.key)}">
              <b>${item.icon}</b>
              <strong>${escapeHtml(item.monthLabel)} ${escapeHtml(item.title)}</strong>
              <small>${item.value.toLocaleString()}${trophyValueUnit(item.key)} · ${currentLang === "vi" ? "Đã lưu" : "저장됨"}</small>
            </article>
          `).join("")}
        </div>
      ` : `<div class="achievement-empty">${escapeHtml(empty)}</div>`}
    </section>
  `;
}

function performancePeriodSummary(person, period, targetDate) {
  if (!person || !targetDate) return { xp: 0, workedDays: 0, pendingXp: 0 };
  const range = periodDateRange(period, targetDate);
  const approvedEntries = (state.personalEntries || []).filter((entry) => (
    entry.staffId === person.id &&
    entry.date >= range.start &&
    entry.date <= range.end &&
    Number(entry.worked || 0)
  ));
  const pendingEntries = (state.selfChecks || []).filter((entry) => (
    entry.staffId === person.id &&
    entry.date >= range.start &&
    entry.date <= range.end &&
    ["live", "pending"].includes(entry.status)
  ));
  return {
    xp: approvedEntries.reduce((sum, entry) => sum + getApprovedXp(entry), 0),
    workedDays: approvedEntries.length,
    pendingXp: pendingEntries.reduce((sum, entry) => sum + estimateSelfCheckXp(entry), 0),
  };
}

function periodDateRange(period, targetDate) {
  const base = parseLocalDate(targetDate);
  if (period === "month") {
    const start = new Date(base.getFullYear(), base.getMonth(), 1);
    const end = new Date(base.getFullYear(), base.getMonth() + 1, 0);
    return { start: toInputDate(start), end: toInputDate(end) };
  }
  const mondayOffset = (base.getDay() + 6) % 7;
  const start = new Date(base);
  start.setDate(base.getDate() - mondayOffset);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { start: toInputDate(start), end: toInputDate(end) };
}

function renderMyProfileCard({ person, name, role, xp, level, streak, myRank, copy, growthCard }) {
  const profilePhoto = profilePhotoDataUrl(person);
  const labels = currentLang === "vi"
    ? {
        profile: "Hồ sơ",
        settings: "Cài đặt",
        language: "Ngôn ngữ",
        korean: "Tiếng Hàn",
        vietnamese: "Tiếng Việt",
        role: "Vai trò",
        level: "Cấp",
        streak: "Streak",
        rank: "Hạng",
      }
    : {
        profile: "내 프로필",
        settings: "설정",
        language: "언어 설정",
        korean: "한국어",
        vietnamese: "Tiếng Việt",
        role: "역할",
        level: "레벨",
        streak: "스트릭",
        rank: "순위",
  };
  return `
    <section class="my-profile-shell">
      <div class="my-profile-topline">
        <span class="mini-label">${escapeHtml(copy.myProfile)}</span>
        <details class="my-settings-menu">
          <summary aria-label="${escapeHtml(labels.settings)}" title="${escapeHtml(labels.settings)}">⚙</summary>
          <div class="my-settings-popover">
            <strong>${escapeHtml(labels.language)}</strong>
            <div class="my-language-buttons language-switch" aria-label="${escapeHtml(labels.language)}">
              <button class="btn ghost ${currentLang === "ko" ? "is-active" : ""}" type="button" data-lang="ko">${escapeHtml(labels.korean)}</button>
              <button class="btn ghost ${currentLang === "vi" ? "is-active" : ""}" type="button" data-lang="vi">${escapeHtml(labels.vietnamese)}</button>
            </div>
          </div>
        </details>
      </div>
      <div class="my-profile-main">
        <label class="my-avatar-frame my-avatar-upload ${profilePhoto ? "has-photo" : ""}" title="${currentLang === "vi" ? "Đổi ảnh hồ sơ" : "프로필 사진 변경"}">
          ${profilePhoto
            ? `<img class="my-profile-avatar-photo" src="${escapeHtml(profilePhoto)}" alt="${escapeHtml(name)} 프로필 사진" />`
            : `<div class="mini-hati my my-profile-avatar" aria-hidden="true"></div>`}
          <span class="my-avatar-change-badge">${currentLang === "vi" ? "Đổi ảnh" : "사진 변경"}</span>
          <input type="file" accept="image/*" data-profile-photo-input data-profile-staff-id="${escapeHtml(person.id)}" />
        </label>
        <div class="my-profile-copy">
          <label class="my-edit-button" title="${currentLang === "vi" ? "Đổi ảnh hồ sơ" : "프로필 사진 변경"}">
            <span aria-hidden="true">✎</span>
            <input type="file" accept="image/*" data-profile-photo-input data-profile-staff-id="${escapeHtml(person.id)}" />
          </label>
          <span class="mini-label">${copy.myProfile}</span>
          <h3>${escapeHtml(name)}</h3>
          <p>${escapeHtml(role)}</p>
          <dl>
            <div><dt>${labels.level}</dt><dd>${level}</dd></div>
            <div><dt>${labels.streak}</dt><dd>${streak}</dd></div>
            <div><dt>${labels.rank}</dt><dd>${myRank ? `${copy.rankShort}${myRank}${copy.rankSuffix}` : copy.rankingWaiting}</dd></div>
          </dl>
        </div>
      </div>
      ${growthCard}
    </section>
  `;
}

function renderMyAttendanceCard(person, streakDays, copy) {
  const labels = currentLang === "vi"
    ? {
        title: `${streakDays} ngày Streak`,
        help: "Đi làm theo lịch để giữ streak.",
        week: "Tuần này",
        month: "Tháng này",
        monthSummary: "Lịch chấm công tháng",
        expand: "Xem cả tháng",
        attended: "Đã chấm",
        scheduled: "Lịch làm",
        off: "Nghỉ",
        waiting: "Chờ",
        days: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      }
    : {
        title: `${streakDays}일 스트릭`,
        help: "근무일에 출근 체크하면 스트릭이 이어져요.",
        week: "이번 주 출석",
        month: "이번 달 출석",
        monthSummary: "한 달 출석표",
        expand: "한 달 보기",
        attended: "출석",
        scheduled: "근무일",
        off: "휴무",
        waiting: "예정",
        days: ["월", "화", "수", "목", "금", "토", "일"],
      };
  const days = buildAttendanceWeek(person);
  const monthDays = buildAttendanceMonth(person);
  const workedCount = days.filter((day) => day.worked).length;
  const scheduledCount = days.filter((day) => day.scheduled).length;
  const monthWorkedCount = monthDays.filter((day) => day.worked).length;
  const monthScheduledCount = monthDays.filter((day) => day.scheduled).length;
  return `
    <details class="my-attendance-card">
      <summary aria-label="${escapeHtml(labels.expand)}">
        <div class="my-attendance-head">
          <div class="my-flame" aria-hidden="true">●</div>
          <span class="my-attendance-arrow" aria-hidden="true">›</span>
        </div>
        <strong>${labels.title}</strong>
        <p>${labels.help}</p>
        <div class="my-attendance-meta">
          <span>${labels.week}</span>
          <b>${workedCount}/${scheduledCount || 0}</b>
        </div>
        <div class="my-week-dots" aria-label="${labels.week}">
          ${days.map((day, index) => `
            <span class="${attendanceDotClass(day)}">
              <b>${labels.days[index]}</b>
              <small>${attendanceStatusLabel(day, labels)}</small>
            </span>
          `).join("")}
        </div>
      </summary>
      <div class="my-month-attendance">
        <div class="my-attendance-meta">
          <span>${labels.month}</span>
          <b>${monthWorkedCount}/${monthScheduledCount || 0}</b>
        </div>
        <div class="my-month-grid" aria-label="${escapeHtml(labels.monthSummary)}">
          ${monthDays.map((day) => `
            <span class="${attendanceDotClass(day)}">
              <b>${day.day}</b>
              <small>${attendanceStatusLabel(day, labels)}</small>
            </span>
          `).join("")}
        </div>
      </div>
    </details>
  `;
}

function attendanceDotClass(day) {
  return `${day.worked ? "is-done" : ""} ${day.today ? "is-today" : ""} ${day.scheduled ? "" : "is-off"}`.trim();
}

function attendanceStatusLabel(day, labels) {
  if (day.worked) return labels.attended;
  if (day.scheduled) return labels.waiting;
  return labels.off;
}

function buildAttendanceWeek(person) {
  const selectedDate = parseLocalDate(els.date.value);
  const monday = new Date(selectedDate);
  monday.setDate(selectedDate.getDate() - ((selectedDate.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const key = toInputDate(date);
    const scheduled = person ? isScheduledWorkDay(person, key) : false;
    const checkedToday = person && key === els.date.value && person.id === els.staffSelect.value && Boolean(els.attendance?.checked);
    return {
      date: key,
      scheduled,
      today: key === els.date.value,
      worked: scheduled && (checkedToday || (person ? hasWorkedRecord(person.id, key) : false)),
    };
  });
}

function buildAttendanceMonth(person) {
  const selectedDate = parseLocalDate(els.date.value);
  const start = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const end = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
  return Array.from({ length: end.getDate() }, (_, index) => {
    const date = new Date(start);
    date.setDate(index + 1);
    const key = toInputDate(date);
    const scheduled = person ? isScheduledWorkDay(person, key) : false;
    const checkedToday = person && key === els.date.value && person.id === els.staffSelect.value && Boolean(els.attendance?.checked);
    return {
      day: index + 1,
      date: key,
      scheduled,
      today: key === els.date.value,
      worked: scheduled && (checkedToday || (person ? hasWorkedRecord(person.id, key) : false)),
    };
  });
}

function questCompletionSnapshot() {
  const person = selectedStaff();
  const { activeEntry, personalEntry } = currentDayQuestRecord(person, els.date.value);
  const quests = [
    questEnabled("attendance") ? Boolean(els.attendance.checked || activeEntry?.attendance || personalEntry?.worked || activeEntry?.attendanceTime || personalEntry?.attendanceTime) : null,
    questEnabled("goal") ? Boolean(els.goal.checked || entryHasGoal(activeEntry) || entryHasGoal(personalEntry)) : null,
    questEnabled("cleaning") ? Boolean((els.cleaning.checked && Boolean(els.cleanArea?.value)) || entryHasCleaning(activeEntry) || entryHasCleaning(personalEntry)) : null,
  ].filter((value) => value !== null);
  return {
    completed: quests.filter(Boolean).length,
    total: quests.length || 1,
  };
}

function renderAnnouncement() {
  if (!els.announcementCard) return;
  const latest = recentAnnouncements(state.announcements)[0];
  if (!latest) {
    els.announcementCard.classList.add("is-hidden");
    return;
  }
  els.announcementCard.classList.remove("is-hidden");
  els.announcementType.textContent = announcementTypeLabel(latest.type);
  els.announcementTitle.textContent = latest.title || "오늘의 공지";
  els.announcementMessage.textContent = latest.message || "";
}

function recentAnnouncements(announcements) {
  return (Array.isArray(announcements) ? announcements : [])
    .filter((item) => String(item?.title || "").trim() || String(item?.message || "").trim())
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

function renderOperationPoints() {
  if (!els.operationPointList) return;
  els.operationPointList.innerHTML = effectiveOperationPoints()
    .map((point) => `<span>${escapeHtml(operationPointDisplayLabel(point))}</span>`)
    .join("");
}

function operationPointSummary() {
  const points = effectiveOperationPoints();
  if (!points.length) return `${t("summaryGoal")}: -`;
  return `${t("summaryGoal")}: ${points.map(operationPointDisplayLabel).join(", ")}`;
}

function renderCheckinGoalList(copy) {
  const points = effectiveOperationPoints();
  return `
    <div class="checkin-goal-list" aria-label="${escapeHtml(t("operationPointsAria"))}">
      ${points.map((point) => `
        <span>
          <b>${escapeHtml(operationPointDisplayLabel(point))}</b>
        </span>
      `).join("")}
    </div>
  `;
}

function renderCheckinGoalMapCard(hasGoal) {
  const vi = currentLang === "vi";
  const points = effectiveOperationPoints();
  const mode = operationPointMode();
  const hasPoints = points.length > 0;
  return `
    <div class="checkin-goal-map-card ${hasGoal ? "is-complete" : ""}">
      <div class="checkin-goal-map-head">
        <div>
          <span>${vi ? "TODAY BRIEFING" : "오늘 브리핑"}</span>
          <strong>${hasPoints ? (vi ? "Xác nhận điểm cần tập trung hôm nay" : "오늘 집중 포인트 확인") : (vi ? "Chưa có briefing hôm nay" : "오늘 등록된 운영 포인트 없음")}</strong>
        </div>
        <b>${hasGoal ? (vi ? "Đã xong" : "완료") : (vi ? "Cần xác nhận" : "확인 필요")}</b>
      </div>
      <div class="checkin-goal-list" aria-label="${escapeHtml(t("operationPointsAria"))}">
        ${hasPoints ? points.map((point) => `
          <span>
            <b>${escapeHtml(operationPointDisplayLabel(point))}</b>
          </span>
        `).join("") : `<span><b>${vi ? "Manager has not added points yet." : "매니저가 아직 입력하지 않았어요."}</b></span>`}
      </div>
      <button class="mini-tab-jump primary" type="button" data-goal-confirm ${hasGoal ? "disabled" : ""}>
        ${hasGoal ? (vi ? "Đã xác nhận" : "확인 완료") : (vi ? "Xác nhận mục tiêu" : "오늘 목표맵 확인하기")}
      </button>
    </div>
  `;
}

function renderCheckinReadyCard(hasAttendance, hasGoal) {
  if (!hasAttendance || !hasGoal) return "";
  const vi = currentLang === "vi";
  return `
    <div class="checkin-ready-card">
      <div class="checkin-ready-icon" aria-hidden="true">✓</div>
      <div>
        <span>${vi ? "READY" : "출근 준비 완료"}</span>
        <strong>${vi ? "Bạn đã sẵn sàng cho ca hôm nay" : "오늘 시작 준비가 끝났어요"}</strong>
        <p>${vi ? "Nếu có thành tích, ghi ở tab thành tích. Cuối ca gửi ở tab tan ca." : "성과가 생기면 성과 탭에 남기고, 마지막엔 퇴근 탭에서 제출하세요."}</p>
      </div>
      <button class="mini-tab-jump primary" type="button" data-jump-tab="performance">${vi ? "Ghi thành tích" : "성과 남기기"}</button>
    </div>
  `;
}

function renderCheckinNoticeCard(stage) {
  const vi = currentLang === "vi";
  const points = effectiveOperationPoints().slice(0, 5);
  const hasPoints = points.length > 0;
  const title = vi ? "Briefing hôm nay" : "오늘 브리핑";
  const message = hasPoints
    ? (vi ? "Xem nhanh mục tiêu riêng của hôm nay." : "오늘만 집중할 포인트를 확인해요.")
    : (vi ? "Quản lý chưa thêm briefing hôm nay." : "매니저가 오늘 운영 포인트를 입력하면 여기에 보여요.");
  const asset = stage?.asset || "seed";
  return `
    <div class="checkin-notice-card">
      <div class="checkin-notice-avatar hati-stage-${escapeHtml(asset)}" aria-hidden="true"></div>
      <div class="checkin-notice-copy">
        <span>${vi ? "TODAY BRIEFING" : "TODAY BRIEFING"}</span>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(message)}</p>
        <div class="checkin-notice-points" aria-label="${escapeHtml(t("operationPointsAria"))}">
          ${points.map((point) => `<b>${escapeHtml(operationPointDisplayLabel(point))}</b>`).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderCheckinMoodCard() {
  const vi = currentLang === "vi";
  const options = vi
    ? [
        { value: "good", icon: "😊", label: "Tốt" },
        { value: "calm", icon: "🙂", label: "Bình ổn" },
        { value: "tired", icon: "😴", label: "Mệt" },
        { value: "cheer", icon: "💚", label: "Cần cổ vũ" },
      ]
    : [
        { value: "good", icon: "😊", label: "좋아요" },
        { value: "calm", icon: "🙂", label: "평온" },
        { value: "tired", icon: "😴", label: "피곤" },
        { value: "cheer", icon: "💚", label: "응원" },
      ];
  const selected = options.find((option) => option.value === checkinMood);
  const feedback = selected
    ? (vi
      ? `Tâm trạng hôm nay: ${selected.label}. HATI sẽ cổ vũ bạn.`
      : `오늘 기분: ${selected.label}. 하티가 맞춰서 응원할게요.`)
    : (vi ? "Chọn nhẹ cảm xúc trước ca nhé." : "오늘 컨디션을 선택해보세요.");
  return `
    <section class="mood-check-card checkin-mood-card" aria-label="${vi ? "Chọn tâm trạng hôm nay" : "오늘 기분 선택"}">
      <div class="mood-check-head">
        <div>
          <h3>${vi ? "Hôm nay bạn thấy thế nào?" : "오늘 기분은 어때요?"}</h3>
          <p>${vi ? "Ghi nhẹ cảm xúc trước ca, HATI sẽ cổ vũ phù hợp." : "출근 전 컨디션을 가볍게 남기면 하티가 맞춰서 응원해줘요."}</p>
        </div>
      </div>
      <div class="mood-options">
        ${options.map((option) => `
          <button class="${option.value === checkinMood ? "is-complete" : ""}" type="button" data-checkin-mood="${escapeHtml(option.value)}">
            <span>${option.icon}</span>${escapeHtml(option.label)}
          </button>
        `).join("")}
      </div>
      <div class="mood-feedback ${selected ? "is-visible" : ""}">${escapeHtml(feedback)}</div>
    </section>
  `;
}

function operationPointDisplayLabel(value) {
  const key = String(value || "").trim();
  const labels = {
    "추천 메뉴": { ko: "추천 메뉴", vi: "Món cần đẩy" },
    "추천메뉴": { ko: "추천메뉴", vi: "Món cần đẩy" },
    "오늘 추천 메뉴": { ko: "오늘 추천 메뉴", vi: "Món cần đẩy hôm nay" },
    "리뷰 요청": { ko: "리뷰 요청", vi: "Nhắc khách review" },
    "리뷰": { ko: "리뷰", vi: "Review" },
    "멤버십/적립 안내": { ko: "멤버십/적립 안내", vi: "Giới thiệu membership/tích điểm" },
    "멤버십 안내": { ko: "멤버십 안내", vi: "Giới thiệu membership" },
    "멤버십": { ko: "멤버십", vi: "Membership" },
    "피크타임 역할": { ko: "피크타임 역할", vi: "Vai trò giờ cao điểm" },
    "서비스 목표": { ko: "서비스 목표", vi: "Mục tiêu phục vụ" },
  };
  return labels[key]?.[currentLang] || key;
}

function announcementTypeLabel(type) {
  const labels = currentLang === "vi"
    ? { goal: "Thông báo hôm nay", event: "Sự kiện", mission: "Nhiệm vụ mới", cheer: "Cổ vũ" }
    : { goal: "오늘의 공지", event: "이벤트", mission: "새 미션", cheer: "응원" };
  return labels[type] || "공지";
}

function renderRankingList(container, rows, period) {
  const visibility = normalizeStoreSettings(state.storeSettings).rankingVisibility;
  if (visibility === "private") {
    container.innerHTML = `<div class="empty-state">${t("rankingPrivate")}</div>`;
    return;
  }

  const ranked = rows
    .filter((row) => row.workedDays > 0)
    .sort((a, b) => b.average - a.average || b.workedDays - a.workedDays);
  const selectedId = selectedStaff()?.id;
  const topRows = visibility === "all" ? ranked : ranked.slice(0, 3);
  const selectedIndex = ranked.findIndex((row) => row.id === selectedId);
  const showSelected = selectedIndex >= 3 && visibility !== "private";
  const visibleRows = showSelected ? [...topRows, { ...ranked[selectedIndex], isMine: true, rankNo: selectedIndex + 1 }] : topRows;

  if (!visibleRows.length) {
    container.innerHTML = `<div class="empty-state">${t("noRanking")}</div>`;
    return;
  }

  container.innerHTML = visibleRows.map((row, index) => `
    <article class="employee-rank-card ${row.isMine ? "is-mine" : ""}">
      <div class="employee-rank-no">${row.rankNo || index + 1}</div>
      ${renderRankProfileAvatar(row, index)}
      <div>
        <strong>${escapeHtml(row.name)}${row.isMine ? ` · ${currentLang === "vi" ? "Hạng của tôi" : "내 순위"}` : ""}</strong>
        <small>${roleLabel(row.role)} · ${period === "weekly" ? t("weeklyMeta") : t("monthlyMeta")} · ${row.workedDays}${t("daysUnit")}</small>
      </div>
      <div class="employee-rank-score">
        <strong>${formatScore(row.average)}</strong>
        <span>${kpiStatus(row.average)}</span>
      </div>
    </article>
  `).join("");
}

function renderRankProfileAvatar(row, index) {
  const staffProfile = activeStaff().find((person) => person.id === row.id) || row;
  const photo = profilePhotoDataUrl(staffProfile) || profilePhotoDataUrl(row);
  if (photo) {
    return `<img class="employee-rank-avatar employee-rank-photo" src="${escapeHtml(photo)}" alt="${escapeHtml(row.name)} 프로필 사진" />`;
  }
  return `<div class="avatar rank-avatar rank-avatar-${Math.min(index + 1, 9)} employee-rank-avatar" aria-hidden="true"></div>`;
}

function updateQuestProgress() {
  const person = selectedStaff();
  const isHall = isHallRole(person?.role);
  const isKitchen = isKitchenRole(person?.role);
  const isMarketer = isMarketerRole(person?.role);
  const coreQuests = [
    questEnabled("attendance") ? { done: els.attendance.checked, xp: 10 } : null,
    questEnabled("goal") ? { done: els.goal.checked, xp: 10 } : null,
    questEnabled("cleaning") ? { done: els.cleaning.checked && Boolean(els.cleanArea?.value), xp: 10 } : null,
  ].filter(Boolean);
  const optionalQuests = [
    questEnabled("help") ? { done: readRealtimeCount(els.helpCount) > 0 || praiseSkipped, xp: readRealtimeCount(els.helpCount) > 0 ? 10 : 0 } : null,
  ].filter(Boolean);
  const activePerformanceRole = isKitchen ? "kitchen" : isMarketer ? "marketer" : isHall ? "hall" : "";
  const bonusQuests = activePerformanceRole && questEnabled("serviceXp")
    ? performanceItemsForRole(activePerformanceRole)
        .map((item) => {
          const count = readRealtimeCount(document.querySelector(`#${CSS.escape(item.id)}`));
          return { done: count > 0, xp: count * Number(item.xp || 1) };
        })
    : [];
  const completedCore = coreQuests.filter((quest) => quest.done).length;
  const percent = coreQuests.length ? Math.round((completedCore / coreQuests.length) * 100) : 100;
  const totalXp = [...coreQuests, ...optionalQuests, ...bonusQuests]
    .filter((quest) => quest.done)
    .reduce((sum, quest) => sum + quest.xp, 0);
  const streak = person ? workStreak(person, els.date.value) : 0;
  const approvedXp = person ? getApprovedXpForStaff(person.id) : 0;
  const approvedLevel = levelFromApprovedXp(approvedXp);
  const levelUpLevel = maybeCelebrateLevelUp(person, approvedLevel);

  if (els.todayXp) els.todayXp.textContent = `${totalXp} XP`;
  if (els.heroXpChip) els.heroXpChip.textContent = `${totalXp} XP`;
  els.employeePhone?.style.setProperty("--quest-progress", `${percent}%`);
  if (lastRenderedXp !== null && totalXp !== lastRenderedXp) {
    els.employeePhone?.classList.remove("is-xp-pulse");
    void els.employeePhone?.offsetWidth;
    els.employeePhone?.classList.add("is-xp-pulse");
  }
  lastRenderedXp = totalXp;
  if (els.questLevel) els.questLevel.textContent = `Lv. ${approvedLevel}`;
  if (els.questStreak) els.questStreak.textContent = currentLang === "vi" ? `${streak} ngày` : `${streak}일`;
  els.questProgressText.textContent = `${percent}%`;
  els.questProgressFill.style.width = `${percent}%`;
  els.employeePhone?.setAttribute("data-quest-complete", percent >= 100 ? "true" : "false");
  updateQuestCardStates();
  updateEmotionFeedback(percent, levelUpLevel);
  const activeTab = els.employeeTabButtons.find((button) => button.classList.contains("is-active"))?.dataset.employeeTab || "home";
  renderEmployeeTabPanel(activeTab);
}

function updateQuestCardStates() {
  const cardStates = {
    attendance: Boolean(els.attendance?.checked),
    goal: Boolean(els.goal?.checked),
    cleaning: Boolean(els.cleaning?.checked && els.cleanArea?.value),
    help: readRealtimeCount(els.helpCount) > 0 || praiseSkipped,
    photo: photos.length > 0,
  };
  Object.entries(cardStates).forEach(([key, done]) => {
    els.questCards?.[key]?.classList.toggle("is-done", done);
  });
  document.querySelectorAll(".performance-count").forEach((input) => {
    const done = readRealtimeCount(input) > 0;
    const card = input?.closest(".realtime-card");
    card?.classList.toggle("is-done", done);
    if (input?.dataset.performanceRole === "hall") {
      const plus = card?.querySelector(".realtime-plus");
      if (plus) {
        plus.textContent = done ? (currentLang === "vi" ? "Đã hoàn thành" : "완료됨") : t("reportButton");
        plus.disabled = done;
      }
    }
  });
}

function updateEmotionFeedback(percent, levelUpLevel = 0) {
  const person = selectedStaff();
  const setMood = (mood, titleKey, textKey) => {
    els.employeePhone?.setAttribute("data-hati-mood", mood);
    if (els.hatiMoodTitle) els.hatiMoodTitle.textContent = t(titleKey);
    if (els.hatiMoodText) els.hatiMoodText.textContent = t(textKey);
  };
  if (!person) {
    setMood("rest", "hatiMoodRestTitle", "hatiMoodRestText");
    els.emotionTitle.textContent = t("emotionRestTitle");
    els.emotionText.textContent = t("emotionRestText");
    return;
  }
  const activeLevel = levelUpLevel || activeLevelUpLevel(person);
  if (activeLevel) {
    setMood("done", "levelUpTitle", "levelUpText");
    els.emotionTitle.textContent = t("levelUpTitle");
    els.emotionText.textContent = `Lv. ${activeLevel} · ${t("levelUpText")}`;
    return;
  }
  if (percent >= 100) {
    setMood("done", "hatiMoodDoneTitle", "hatiMoodDoneText");
    els.emotionTitle.textContent = t("emotionDoneTitle");
    els.emotionText.textContent = t("emotionDoneText");
    return;
  }
  if (percent > 0) {
    setMood("started", "hatiMoodStartedTitle", "hatiMoodStartedText");
    els.emotionTitle.textContent = t("emotionStartedTitle");
    els.emotionText.textContent = t("emotionStartedText");
    return;
  }
  setMood("ready", "hatiMoodReadyTitle", "hatiMoodReadyText");
  els.emotionTitle.textContent = t("emotionReadyTitle");
  els.emotionText.textContent = t("emotionReadyText");
}

function workStreak(person, endDate) {
  if (!person || !endDate) return 0;
  let count = 0;
  const date = parseLocalDate(endDate);
  for (let index = 0; index < 90; index += 1) {
    const key = toInputDate(date);
    if (isScheduledWorkDay(person, key)) {
      const checkedToday = key === endDate && els.attendance.checked && person.id === els.staffSelect.value;
      if (checkedToday || hasWorkedRecord(person.id, key)) {
        count += 1;
      } else {
        break;
      }
    }
    date.setDate(date.getDate() - 1);
  }
  return count;
}

function hasWorkedRecord(staffId, date) {
  const approvedEntry = (state.personalEntries || []).some((entry) => (
    entry.staffId === staffId && entry.date === date && entry.worked
  ));
  const submittedEntry = (state.selfChecks || []).some((entry) => (
    entry.staffId === staffId && entry.date === date && entry.status !== "rejected" && entry.attendance
  ));
  return approvedEntry || submittedEntry;
}

function buildWeeklyRows() {
  return buildRankingRows(recentEntries(state.personalEntries || [], 7));
}

function buildMonthlyRows() {
  return buildRankingRows(monthEntries(state.personalEntries || [], toMonthInput(new Date())));
}

function buildRankingRows(entries) {
  return activeStaff().filter((person) => !isManagerRole(person.role)).map((person, index) => {
    const personEntries = entries.filter((entry) => entry.staffId === person.id && entry.worked);
    const scores = personEntries.map((entry) => calculatePersonalDaily(entry, person.role).total);
    return {
      ...person,
      name: visibleStaffName(person, index),
      workedDays: personEntries.length,
      average: scores.length ? average(scores) : 0,
    };
  });
}

function renderEmployeePerformanceRankings(copy) {
  if (rankingVisibilityIsPrivate()) return "";
  const boards = buildEmployeePerformanceBoards();
  if (!boards.length) return "";
  const activeKey = boards[0]?.key || "";
  return `
    <section class="employee-performance-rankings" aria-label="${currentLang === "vi" ? "Xếp hạng thành tích" : "성과왕 랭킹"}">
      <div class="employee-performance-head">
        <strong>${currentLang === "vi" ? "Bảng thành tích" : "성과왕 랭킹"}</strong>
        <span>${currentLang === "vi" ? "Tháng này" : "이번달"}</span>
      </div>
      <div class="employee-award-categories" role="tablist" aria-label="${currentLang === "vi" ? "Loại bảng xếp hạng" : "랭킹 카테고리"}">
        ${boards.map((board) => renderEmployeeAwardCategory(board, board.key === activeKey)).join("")}
      </div>
      <div class="employee-performance-grid">
        ${boards.map((board) => renderEmployeePerformanceBoard(board, copy, board.key === activeKey)).join("")}
      </div>
    </section>
  `;
}

function renderEmployeeAwardCategory(board, isActive = false) {
  const topValue = board.rows.filter((row) => row.value > 0)[0]?.value || 0;
  const valueText = topValue > 0
    ? `${Number(topValue || 0).toLocaleString()}${board.unit}`
    : (currentLang === "vi" ? "Chờ" : "대기");
  return `
    <button
      class="employee-award-category ${board.key} ${isActive ? "is-active" : ""}"
      type="button"
      role="tab"
      aria-selected="${isActive ? "true" : "false"}"
      data-award-category="${escapeHtml(board.key)}"
    >
      <b>${escapeHtml(board.mark)}</b>
      <span>
        <strong>${escapeHtml(board.title)}</strong>
        <small>${escapeHtml(board.meta)}</small>
      </span>
      <em>${escapeHtml(valueText)}</em>
    </button>
  `;
}

function configuredRankingSettings() {
  if (rankingVisibilityIsPrivate()) return [];
  const rawRankings = Array.isArray(state.storeSettings?.rankingSettings) ? state.storeSettings.rankingSettings : [];
  const disabledIds = new Set(rawRankings.filter((item) => toBoolean(item?.enabled, true) === false).map((item) => String(item?.id || "").trim()).filter(Boolean));
  const disabledTitles = new Set(rawRankings.filter((item) => toBoolean(item?.enabled, true) === false).map((item) => String(item?.title || "").trim()).filter(Boolean));
  return normalizeRankingSettings(state.storeSettings?.rankingSettings, normalizePerformanceItems(state.storeSettings?.performanceItems))
    .filter((item) => toBoolean(item.enabled, true))
    .filter((item) => !disabledIds.has(item.id) && !disabledTitles.has(item.title))
    .filter((item) => rankingMissionIsActive(item));
}

function rankingVisibilityIsPrivate() {
  return normalizeStoreSettings(state.storeSettings).rankingVisibility === "private";
}

function rankingMissionIsActive(ranking) {
  const missionIds = new Set(ranking?.missionIds || []);
  if (!missionIds.size) return false;
  if (missionIds.has("praise")) return true;
  const items = allPerformanceItems().filter((item) => toBoolean(item.enabled, true));
  if (missionIds.has("kitchen-performance") && items.some((item) => item.role === "kitchen")) return true;
  if (missionIds.has("marketer-performance") && items.some((item) => item.role === "marketer")) return true;
  return items.some((item) => missionIds.has(item.id));
}

function rankingAppliesToRole(ranking, role) {
  if (!ranking) return false;
  if (ranking.role === "all") return true;
  if (ranking.role === "hall") return isHallRole(role);
  if (ranking.role === "kitchen") return isKitchenRole(role);
  if (ranking.role === "marketer") return isMarketerRole(role);
  return false;
}

function currentRankingCandidate(person) {
  const role = person?.role || "hall";
  const ranking = configuredRankingSettings().find((item) => rankingAppliesToRole(item, role));
  if (!ranking) return null;
  const title = ranking.title;
  const cheer = ranking.cheer || (currentLang === "vi" ? "Cố thêm chút nữa là gần cúp tháng này." : "조금만 더 힘내면 이번달 트로피에 가까워져요.");
  const rows = ranking ? buildRankingRowsForSetting(ranking, monthlyActivityEntries()) : [];
  const myRow = rows.find((row) => row.id === person?.id);
  const value = myRow?.value || 0;
  const topValue = rows[0]?.value || 0;
  const gap = Math.max(0, topValue - value);
  const unit = currentLang === "vi" ? "lần" : "건";
  const rankText = myRow?.rankNo
    ? (currentLang === "vi" ? `Hạng ${myRow.rankNo}` : `${myRow.rankNo}위`)
    : (currentLang === "vi" ? "Chờ xếp hạng" : "랭킹 대기");
  const gapText = gap > 0
    ? (currentLang === "vi" ? `Còn ${gap.toLocaleString()} ${unit} tới hạng 1` : `1등까지 ${gap.toLocaleString()}${unit} 남았어요`)
    : value > 0
      ? (currentLang === "vi" ? "Đang ở nhóm dẫn đầu" : "지금 1등권이에요")
      : (currentLang === "vi" ? "Hoàn thành một nhiệm vụ để bắt đầu" : "첫 기록을 남기면 랭킹이 시작돼요");
  return {
    title: currentLang === "vi" ? `Ứng viên ${title}!` : `${title} 후보예요!`,
    cheer,
    value,
    valueText: value > 0 ? `${Number(value).toLocaleString()}${unit}` : (currentLang === "vi" ? "Chờ" : "대기"),
    rankText,
    gap,
    gapText,
    trophyText: ranking?.monthlyTrophy === false
      ? (currentLang === "vi" ? "Cúp tháng OFF" : "월간 트로피 OFF")
      : (currentLang === "vi" ? "Cúp tháng ON" : "월간 트로피 ON"),
    progress: topValue > 0 ? Math.min(100, Math.round((value / topValue) * 100)) : 0,
  };
}

function buildEmployeePerformanceBoards() {
  const entries = monthlyActivityEntries();
  return configuredRankingSettings().map((ranking) => ({
    key: ranking.id,
    title: ranking.title,
    meta: ranking.cheer || rankingMissionMeta(ranking),
    mark: ranking.mark || "🏆",
    unit: currentLang === "vi" ? "lần" : "건",
    rows: buildRankingRowsForSetting(ranking, entries),
  }));
}

function rankingMissionMeta(ranking) {
  const ids = new Set(ranking?.missionIds || []);
  const items = allPerformanceItems().filter((item) => ids.has(item.id));
  if (ids.has("praise")) return currentLang === "vi" ? "Được đồng đội khen" : "동료에게 받은 칭찬";
  if (ids.has("kitchen-performance")) return currentLang === "vi" ? "Nhiệm vụ vệ sinh đang bật" : "켜진 청소 성과 전체";
  if (ids.has("marketer-performance")) return currentLang === "vi" ? "Nhiệm vụ marketing đang bật" : "켜진 마케팅 성과 전체";
  return items.map((item) => performanceItemLabel(item)).join(" + ") || (currentLang === "vi" ? "Thành tích" : "성과 미션");
}

function buildRankingRowsForSetting(ranking, entries) {
  return activeStaff()
    .filter((person) => !isManagerRole(person.role))
    .filter((person) => rankingAppliesToRole(ranking, person.role))
    .map((person, index) => {
      const personEntries = entries.filter((entry) => entry.staffId === person.id);
      return {
        id: person.id,
        name: visibleStaffName(person, index),
        role: person.role,
        value: rankingValueForEntries(ranking, personEntries, person.id, entries),
      };
    })
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .map((row, index) => ({ ...row, rankNo: index + 1 }));
}

function rankingValueForEntries(ranking, personEntries, personId, allEntries = []) {
  const missionIds = new Set(ranking?.missionIds || []);
  let total = 0;
  if (missionIds.has("praise")) {
    total += allEntries.filter((entry) => entry.helpType === personId).length;
  }
  if (missionIds.has("kitchen-performance")) {
    total += personEntries.reduce((sum, entry) => sum + specialCleanCountFromEntry(entry), 0);
  }
  if (missionIds.has("marketer-performance")) {
    const marketerIds = performanceItemsForRole("marketer").map((item) => item.id);
    total += personEntries.reduce((sum, entry) => sum + marketerIds.reduce((inner, id) => inner + performanceCountFromEntry(entry, id), 0), 0);
  }
  const directIds = [...missionIds].filter((id) => !["praise", "kitchen-performance", "marketer-performance"].includes(id));
  total += personEntries.reduce((sum, entry) => (
    sum + directIds.reduce((inner, id) => inner + performanceCountFromEntry(entry, id), 0)
  ), 0);
  return total;
}

function performanceCountFromEntry(entry, itemId) {
  const reports = Array.isArray(entry?.performanceReports) ? entry.performanceReports : [];
  const reportCount = reports
    .filter((report) => report.id === itemId)
    .reduce((sum, report) => sum + Number(report.count || 0), 0);
  if (reportCount > 0) return reportCount;
  const legacyMissionKeys = {
    "review-photo": ["reviewPoint", "membershipPoint"],
    "sales-xp": ["upsellPoint", "recommendedMenuPoint"],
    "team-help": ["helpCount"],
    "thread-post": ["threadPostPoint"],
    "video-post": ["videoPostPoint"],
    "tomorrow-plan": ["tomorrowPlanPoint"],
    "marketing-report": ["marketingReportPoint"],
  };
  if (legacyMissionKeys[itemId]) {
    return legacyMissionKeys[itemId].reduce((sum, key) => sum + Number(entry[key] || 0), 0);
  }
  if (itemId === "reviewPoint") return Number(entry.reviewPoint || 0) + Number(entry.membershipPoint || 0);
  if (itemId === "upsellPoint") return Number(entry.upsellPoint || 0);
  if (itemId === "membershipPoint") return Number(entry.membershipPoint || 0);
  if (itemId === "recommendedMenuPoint") return Number(entry.recommendedMenuPoint || 0);
  if (["threadPostPoint", "videoPostPoint", "tomorrowPlanPoint", "marketingReportPoint"].includes(itemId)) return Number(entry[itemId] || 0);
  const item = performanceItemById(itemId);
  if (item?.role === "kitchen" && (item.areaId === entry.specialCleanArea || item.id === entry.specialCleanArea)) {
    return Number(entry.hygieneFixPoint || 0) > 0 ? 1 : 0;
  }
  return Number(entry[itemId] || 0);
}

function renderEmployeePerformanceBoard(board, copy, isActive = false) {
  const selectedId = selectedStaff()?.id;
  const rankedRows = board.rows.filter((row) => row.value > 0);
  const topRows = rankedRows.slice(0, 3);
  const selectedIndex = rankedRows.findIndex((row) => row.id === selectedId);
  const showSelected = selectedIndex >= 3;
  const visibleRows = showSelected ? [...topRows, { ...rankedRows[selectedIndex], isMine: true }] : topRows;
  return `
    <article class="employee-performance-board ${board.key} ${isActive ? "is-active" : ""}" data-award-board="${escapeHtml(board.key)}">
      <div class="employee-performance-board-head">
        <span class="performance-award-mark">${escapeHtml(board.mark)}</span>
        <div>
          <strong>${escapeHtml(board.title)}</strong>
          <span>${escapeHtml(board.meta)}</span>
        </div>
        <em>${currentLang === "vi" ? "Tháng này" : "이번달"}</em>
      </div>
      <ol>
        ${visibleRows.length ? visibleRows.map((row, index) => `
          <li class="${row.id === selectedId ? "is-mine" : ""}">
            <b>${row.rankNo || index + 1}</b>
            <span class="performance-rank-person">
              <strong>${escapeHtml(row.name)}</strong>
              ${row.id === selectedId ? `<small>${currentLang === "vi" ? "Tôi" : "나"}</small>` : ""}
            </span>
            <em>${Number(row.value || 0).toLocaleString()}${board.unit}</em>
          </li>
        `).join("") : `<li class="is-empty">${copy.noRankingMini}</li>`}
      </ol>
    </article>
  `;
}

function buildPerformanceBoardRows(entries, valueForEntries, filterPerson = () => true) {
  return activeStaff()
    .filter((person) => !isManagerRole(person.role))
    .filter(filterPerson)
    .map((person, index) => {
      const personEntries = entries.filter((entry) => entry.staffId === person.id);
      return {
        id: person.id,
        name: visibleStaffName(person, index),
        role: person.role,
        value: valueForEntries(personEntries),
      };
    })
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .map((row, index) => ({ ...row, rankNo: index + 1 }));
}

function buildPraiseBoardRows(entries) {
  return activeStaff()
    .filter((person) => !isManagerRole(person.role))
    .map((person, index) => ({
      id: person.id,
      name: visibleStaffName(person, index),
      role: person.role,
      value: entries.filter((entry) => entry.helpType === person.id).length,
    }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name))
    .map((row, index) => ({ ...row, rankNo: index + 1 }));
}

function monthlyActivityEntries() {
  const month = toMonthInput(parseLocalDate(els.date.value || toInputDate(new Date())));
  const approved = monthEntries(state.personalEntries || [], month).map((entry) => ({ ...entry, status: "approved" }));
  const approvedSourceIds = new Set(approved.map((entry) => entry.sourceSelfCheckId).filter(Boolean));
  const liveOrPending = monthEntries(state.selfChecks || [], month)
    .filter((entry) => entry.status !== "rejected" && !approvedSourceIds.has(entry.id));
  return [...approved, ...liveOrPending];
}

function specialCleanCountFromEntry(entry) {
  const reportCount = performanceReportsForRole(entry, "kitchen")
    .reduce((sum, report) => sum + Number(report.count || 0), 0);
  if (reportCount > 0) return reportCount;
  return Number(entry?.hygieneFixPoint || 0) > 0 ? Number(entry.hygieneFixPoint || 0) : 0;
}

function weeklyActivityEntries() {
  const approved = recentEntries(state.personalEntries || [], 7).map((entry) => ({ ...entry, status: "approved" }));
  const approvedSourceIds = new Set(approved.map((entry) => entry.sourceSelfCheckId).filter(Boolean));
  const liveOrPending = recentEntries(state.selfChecks || [], 7)
    .filter((entry) => entry.status !== "rejected" && !approvedSourceIds.has(entry.id));
  return [...approved, ...liveOrPending];
}

function weeklyFocusStats(person) {
  if (!person) {
    return {
      reviewMembership: 0,
        sales: 0,
        teamPraise: 0,
        cleaning: 0,
        marketing: 0,
      };
  }
  const entries = weeklyActivityEntries();
  const ownEntries = entries.filter((entry) => entry.staffId === person.id);
  return {
    reviewMembership: ownEntries.reduce((sum, entry) => (
      sum + Number(entry.reviewPoint || 0) + Number(entry.membershipPoint || 0)
    ), 0),
    sales: ownEntries.reduce((sum, entry) => (
      sum + Number(entry.upsellPoint || 0) + Number(entry.recommendedMenuPoint || 0)
    ), 0),
      teamPraise: entries.filter((entry) => entry.helpType === person.id).length,
      cleaning: ownEntries.reduce((sum, entry) => sum + Number(entry.hygieneFixPoint || 0), 0),
      marketing: ownEntries.reduce((sum, entry) => (
        sum + Number(entry.threadPostPoint || 0) + Number(entry.videoPostPoint || 0) + Number(entry.tomorrowPlanPoint || 0) + Number(entry.marketingReportPoint || 0)
      ), 0),
  };
}

function ownWeeklyCount(staffId, key) {
  return weeklyActivityEntries()
    .filter((entry) => entry.staffId === staffId)
    .reduce((sum, entry) => sum + Number(entry[key] || 0), 0);
}

function ownWeeklySpecialCleanCount(staffId) {
  return weeklyActivityEntries()
    .filter((entry) => entry.staffId === staffId)
    .reduce((sum, entry) => sum + specialCleanCountFromEntry(entry), 0);
}

function renderWeeklyFocusBoard(person, copy) {
  if (!person) return "";
    const stats = weeklyFocusStats(person);
    const isKitchen = isKitchenRole(person.role);
    const isMarketer = isMarketerRole(person.role);
    const cards = isKitchen
      ? [
          { label: copy.weeklyCleanTitle, value: stats.cleaning, accent: "green" },
          { label: copy.weeklyTeamPraise, value: stats.teamPraise, accent: "blue" },
        ]
      : isMarketer
        ? [
            { label: t("marketerPointTitle"), value: stats.marketing, accent: "blue" },
            { label: t("threadPostPoint"), value: ownWeeklyCount(person.id, "threadPostPoint"), accent: "green" },
            { label: t("marketingReportPoint"), value: ownWeeklyCount(person.id, "marketingReportPoint"), accent: "mint" },
          ]
      : [
          { label: copy.weeklyReviewMembership, value: stats.reviewMembership, accent: "blue" },
        { label: copy.weeklySalesTitle, value: stats.sales, accent: "green" },
        { label: copy.weeklyTeamPraise, value: stats.teamPraise, accent: "mint" },
      ];
  return `
    <div class="weekly-focus-board">
      <div class="weekly-focus-head">
        <strong>${copy.weeklyFocusTitle}</strong>
        <span>${copy.weeklyFocusMeta}</span>
      </div>
      <div class="weekly-focus-grid">
        ${cards.map((card) => {
          const valueText = currentLang === "vi"
            ? `${Number(card.value || 0).toLocaleString()} ${copy.weeklyCountUnit}`
            : `${Number(card.value || 0).toLocaleString()}${copy.weeklyCountUnit}`;
          return `
          <span class="weekly-focus-card ${card.accent}">
            <strong>${valueText}</strong>
            <small>${escapeHtml(card.label)}</small>
          </span>
        `;
        }).join("")}
      </div>
    </div>
  `;
}

function selfCheckSummary(entry) {
  const items = [];
  if (entry.attendance) items.push(entry.attendanceTime ? `${t("summaryAttendance")} ${entry.attendanceTime}` : t("summaryAttendance"));
  if (entry.checkoutTime) items.push(`${t("summaryCheckout")} ${entry.checkoutTime}`);
  if (entry.cleaningDone) {
    const cleanDetail = [
      entry.cleanArea ? closeAreaDisplayLabel(entry.cleanArea) : "",
      entry.cleanStatus ? cleanStatusDisplayLabel(entry.cleanStatus) : "",
    ].filter(Boolean).join(" · ");
    items.push(cleanDetail ? `${t("summaryCleaning")}(${cleanDetail})` : t("summaryCleaning"));
  }
  if (entry.goalChecked) items.push(t("summaryGoal"));
  const helpCount = entry.helpType ? 1 : 0;
  if (helpCount) {
    const helpLabel = entry.helpType ? helpTypeLabel(entry.helpType) : t("helpLabel");
    const helpParts = [helpLabel, praiseReasonLabel(entry.helpReason), entry.helpNote].filter(Boolean);
    items.push(helpParts.join(": "));
  }
  const hallPoints = Number(entry.reviewPoint || 0)
    + Number(entry.upsellPoint || 0)
    + Number(entry.membershipPoint || 0)
    + Number(entry.recommendedMenuPoint || 0);
  const kitchenContributions = [
    [entry.hygieneFixPoint, entry.specialCleanArea ? `${t("hygieneFixPoint")}(${specialCleanLabel(entry.specialCleanArea)})` : t("hygieneFixPoint")],
  ]
    .filter(([count]) => Number(count || 0) > 0)
    .map(([count, label]) => `${label} ${Number(count)}${currentLang === "vi" ? " lần" : "건"}`);
  const marketerContributions = [
    [entry.threadPostPoint, t("threadPostPoint")],
    [entry.videoPostPoint, t("videoPostPoint")],
    [entry.tomorrowPlanPoint, t("tomorrowPlanPoint")],
    [entry.marketingReportPoint, t("marketingReportPoint")],
  ]
    .filter(([count]) => Number(count || 0) > 0)
    .map(([count, label]) => `${label} ${Number(count)}${currentLang === "vi" ? " lần" : "건"}`);
  if (hallPoints) items.push(`${hallPoints}P`);
  if (kitchenContributions.length) items.push(kitchenContributions.join(" · "));
  if (marketerContributions.length) items.push(marketerContributions.join(" · "));
  return items.join(" · ") || "-";
}

function getApprovedXp(entry) {
  const savedXp = Number(entry.approvedXp);
  if (Number.isFinite(savedXp) && savedXp > 0) return savedXp;
  if (!Number(entry.worked || 0)) return 0;
  let xp = 10;
  if (entry.goalChecked || entry.goalType) xp += 10;
  if (entry.cleaningDone || entry.cleanArea || entry.cleanStatus) xp += 10;
  xp += (Number(entry.helpCount || 0) > 0 || entry.helpType) ? 10 : 0;
  xp += performanceReportsXp(entry);
  return xp;
}

function getApprovedXpForStaff(staffId) {
  if (!staffId) return 0;
  return (state.personalEntries || [])
    .filter((entry) => entry.staffId === staffId && Number(entry.worked || 0))
    .reduce((sum, entry) => sum + getApprovedXp(entry), 0);
}

function getPendingXpForStaff(staffId) {
  if (!staffId) return 0;
  return (state.selfChecks || [])
    .filter((entry) => entry.staffId === staffId && ["live", "pending"].includes(entry.status))
    .reduce((sum, entry) => sum + estimateSelfCheckXp(entry), 0);
}

function readSeenLevels() {
  try {
    const parsed = JSON.parse(localStorage.getItem(levelSeenStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (error) {
    return {};
  }
}

function saveSeenLevels(levels) {
  localStorage.setItem(levelSeenStorageKey, JSON.stringify(levels));
}

function activeLevelUpLevel(person) {
  if (!person || !activeLevelUpNotice) return 0;
  if (activeLevelUpNotice.staffId !== person.id) return 0;
  if (Date.now() > activeLevelUpNotice.expiresAt) {
    activeLevelUpNotice = null;
    return 0;
  }
  return activeLevelUpNotice.level;
}

function maybeCelebrateLevelUp(person, approvedLevel) {
  if (!person) return 0;
  const level = Math.max(1, Number(approvedLevel || 1));
  const seenLevels = readSeenLevels();
  const previousLevel = Number(seenLevels[person.id] || 0);
  if (!previousLevel) {
    seenLevels[person.id] = level;
    saveSeenLevels(seenLevels);
    return activeLevelUpLevel(person);
  }
  if (level > previousLevel) {
    seenLevels[person.id] = level;
    saveSeenLevels(seenLevels);
    activeLevelUpNotice = { staffId: person.id, level, expiresAt: Date.now() + 9000 };
    showLevelUpPraise(level);
    return level;
  }
  if (level < previousLevel) {
    seenLevels[person.id] = level;
    saveSeenLevels(seenLevels);
  }
  return activeLevelUpLevel(person);
}

function estimateSelfCheckXp(entry) {
  let xp = 0;
  if (entry.attendance) xp += 10;
  if (entry.goalChecked || entry.goalType) xp += 10;
  if (entry.cleaningDone || entry.cleanArea || entry.cleanStatus) xp += 10;
  if (Number(entry.helpCount || 0) > 0 || entry.helpType) xp += 10;
  xp += performanceReportsXp(entry);
  return xp;
}

function levelFromApprovedXp(xp) {
  const total = Math.max(0, Number(xp || 0));
  let level = 1;
  levelXpThresholds.forEach((threshold, index) => {
    if (total >= threshold) level = index + 1;
  });
  return Math.min(level, levelXpThresholds.length);
}

function levelProgressInfo(xp) {
  const total = Math.max(0, Number(xp || 0));
  const level = levelFromApprovedXp(total);
  const maxLevel = levelXpThresholds.length;
  if (level >= maxLevel) {
    return {
      level: maxLevel,
      percent: 100,
      remaining: 0,
      maxLevel,
      currentXp: levelXpThresholds[maxLevel - 1],
      nextXp: 0,
    };
  }
  const currentIndex = Math.max(0, Math.min(level - 1, levelXpThresholds.length - 1));
  const currentThreshold = levelXpThresholds[currentIndex] || 0;
  const nextThreshold = levelXpThresholds[currentIndex + 1] || currentThreshold;
  const span = Math.max(1, nextThreshold - currentThreshold);
  const percent = clamp(Math.round(((total - currentThreshold) / span) * 100), 0, 100);
  return {
    level,
    percent,
    remaining: Math.max(0, nextThreshold - total),
    maxLevel,
    currentXp: currentThreshold,
    nextXp: nextThreshold,
  };
}

function hatiStageInfo(level) {
  const stages = [
    { min: 1, asset: 1, nameKey: "stageSeed" },
    { min: 6, asset: 2, nameKey: "stageActive" },
    { min: 11, asset: 3, nameKey: "stageGrow" },
    { min: 16, asset: 4, nameKey: "stagePro" },
    { min: 21, asset: 5, nameKey: "stageAce" },
    { min: 26, asset: 6, nameKey: "stageLegend" },
  ];
  return stages.reduce((selected, stage) => (level >= stage.min ? stage : selected), stages[0]);
}

function statusLabel(status) {
  if (status === "live") return currentLang === "vi" ? "Đang ghi" : "진행중";
  if (status === "approved") return t("statusApproved");
  if (status === "rejected") return t("statusRejected");
  return t("statusPending");
}

function calculatePersonalDaily(entry, role) {
  if (!entry.worked) return { total: 0 };
  if (isMarketerRole(role)) {
    const baseMinus = Number(entry.late || 0)
      + Number(entry.orderMiss || 0)
      + Number(entry.posMistake || 0)
      + Number(entry.unkind || 0)
      + Number(entry.complaint || 0) * 2
      + Number(entry.attitudeIssue || 0)
      + Number(entry.phoneOveruse || 0)
      + Number(entry.handoffMiss || 0)
      + Number(entry.cookDelay || 0)
      + Number(entry.waste || 0);
    return { total: clamp(10 - baseMinus, 0, 10) };
  }
  const isKitchen = isKitchenRole(role);
  const baseMinus = isKitchen
    ? Number(entry.complaint || 0) * 2 + Number(entry.cookDelay || 0) * 2 + Number(entry.waste || 0) + Number(entry.hygieneIssue || 0) + Number(entry.attitudeIssue || 0) + Number(entry.orderMiss || 0) + Number(entry.late || 0) + Number(entry.phoneOveruse || 0)
    : Number(entry.late || 0) + Number(entry.orderMiss || 0) + Number(entry.posMistake || 0) + Number(entry.unkind || 0) + Number(entry.complaint || 0) * 2 + Number(entry.attitudeIssue || 0) + Number(entry.phoneOveruse || 0) + Number(entry.handoffMiss || 0);
  const missed = isKitchen ? 0 : Number(entry.membershipLead || 0) + Number(entry.reviewRequest || 0) + Number(entry.upsellLead || 0);
  return { total: clamp(10 - baseMinus - missed, 0, 10) };
}

function selectedStaff() {
  if (lockedStaffId) {
    return lockedStaff();
  }
  if (!els.staffSelect.value || els.staffSelect.disabled) return undefined;
  return staff.find((person) => person.id === els.staffSelect.value);
}

function lockedStaff() {
  if (!lockedStaffId) return undefined;
  const person = activeStaff().find((item) => item.id === lockedStaffId && !isManagerRole(item.role));
  if (!person) {
    const canonical = canonicalStaffFromLegacyLink();
    if (canonical) return canonical;
    if (cloudStaffLoaded) return undefined;
    return lockedStaffFromUrl();
  }
  if (person.accessToken && lockedStaffToken !== person.accessToken) return undefined;
  return person;
}

function canonicalStaffFromLegacyLink() {
  const legacyName = staffIdentityKey(lockedStaffName);
  if (!legacyName) return undefined;
  const candidates = activeStaff().filter((item) => (
    !isManagerRole(item.role) &&
    rolesShareStaffGroup(item.role, lockedStaffRole || "hall") &&
    namesLookLikeSameStaff(staffIdentityKey(item.name), legacyName)
  ));
  return candidates.length === 1 ? candidates[0] : undefined;
}

function namesLookLikeSameStaff(left, right) {
  if (!left || !right) return false;
  if (left === right) return true;
  const shorter = left.length <= right.length ? left : right;
  const longer = left.length <= right.length ? right : left;
  return shorter.length >= 6 && longer.includes(shorter) && longer.length - shorter.length <= 2;
}

function staffIdentityKey(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ㄱ-ㅎㅏ-ㅣ]/g, "");
}

function rolesShareStaffGroup(leftRole, rightRole) {
  const left = normalizeRole(leftRole);
  const right = normalizeRole(rightRole);
  if (isHallRole(left) && isHallRole(right)) return true;
  if (isKitchenRole(left) && isKitchenRole(right)) return true;
  return left === right;
}

function lockedStaffFromUrl() {
  if (!lockedStaffId || !lockedStaffToken) return undefined;
  const role = normalizeRole(lockedStaffRole || "hall");
  if (isManagerRole(role)) return undefined;
  return {
    id: lockedStaffId,
    name: String(lockedStaffName || "").trim() || fallbackStaffName(role, 0),
    role,
    workDays: allWorkDays,
    offDays: [],
    active: true,
    accessToken: lockedStaffToken,
  };
}

function normalizeStaff(savedStaff) {
  const source = Array.isArray(savedStaff) && savedStaff.length ? savedStaff : defaultStaff;
  const normalized = source.map((person, index) => {
    const role = normalizeRole(person.role || person.type);
    return {
      ...person,
      id: person.id || `staff-${index + 1}`,
      name: String(person.name || "").trim() || fallbackStaffName(role, index),
      role,
      workDays: normalizeWorkDays(person.workDays),
      offDays: normalizeOffDays(person.offDays),
      active: person.active !== false,
      accessToken: String(person.accessToken || ""),
      profilePhotoDataUrl: profilePhotoDataUrl(person),
      profilePhotoUpdatedAt: String(person.profilePhotoUpdatedAt || ""),
    };
  });
  return normalized.some((person) => person.active !== false) ? normalized : defaultStaff;
}

function normalizeStoreSettings(settings) {
  const performanceItems = normalizePerformanceItems(settings?.performanceItems);
  return {
    ...defaultStoreSettings,
    ...(settings || {}),
    operationPoints: normalizeOperationPoints(settings?.operationPoints),
    dailyOperationPoints: normalizeOptionalOperationPoints(settings?.dailyOperationPoints),
    dailyOperationDate: String(settings?.dailyOperationDate || "").trim(),
    customQuests: normalizeCustomQuests(settings?.customQuests),
    questSettings: normalizeQuestSettings(settings?.questSettings),
    performanceItems,
    rankingSettings: normalizeRankingSettings(settings?.rankingSettings, performanceItems),
    teamChallengeSettings: normalizeTeamChallengeSettings(settings?.teamChallengeSettings),
  };
}

function normalizePerformanceItems(items) {
  return {
    hall: normalizePerformanceList(items?.hall, defaultPerformanceItems.hall, "hall"),
    kitchen: normalizePerformanceList(items?.kitchen, defaultPerformanceItems.kitchen, "kitchen"),
    marketer: normalizePerformanceList(items?.marketer, defaultPerformanceItems.marketer, "marketer"),
  };
}

function normalizePerformanceList(list, fallback, role) {
  const hallMissionLabels = {
    reviewPoint: { ko: "리뷰 미션", vi: "Nhiệm vụ review" },
    upsellPoint: { ko: "업셀 미션", vi: "Nhiệm vụ upsell" },
    membershipPoint: { ko: "멤버십 미션", vi: "Nhiệm vụ membership" },
    recommendedMenuPoint: { ko: "추천메뉴 미션", vi: "Nhiệm vụ món đề xuất" },
  };
  const source = Array.isArray(list) && list.length ? list : fallback;
  const normalized = source
    .map((item, index) => {
      const fallbackItem = fallback[index] || fallback[0] || {};
      const id = String(item.id || fallbackItem.id || `${role}-${index + 1}`).trim();
      const missionLabel = role === "hall" ? hallMissionLabels[id] : null;
      const label = String(missionLabel?.ko || item.ko || item.label || item.name || fallbackItem.ko || fallbackItem.label || "").trim();
      const xp = clampPerformancePoints(item.xp ?? item.points ?? fallbackItem.xp ?? 1);
      return {
        id,
        role,
        areaId: item.areaId || fallbackItem.areaId || "",
        ko: label,
        vi: String(missionLabel?.vi || item.vi || item.labelVi || item.ko || item.label || fallbackItem.vi || label).trim(),
        xp,
        max: Number(item.max || fallbackItem.max || 1),
        enabled: toBoolean(item.enabled, true),
      };
    })
    .filter((item) => item.id && item.ko && item.enabled !== false);
  if (Array.isArray(list)) return normalized;
  return normalized.length ? normalized : fallback.map((item) => ({ ...item, role, enabled: toBoolean(item.enabled, true) }));
}

function normalizeRankingSettings(value, performanceItems = normalizePerformanceItems(state.storeSettings?.performanceItems)) {
  const allowedIds = new Set([
    ...Object.values(performanceItems).flat().map((item) => item.id),
    "kitchen-performance",
    "marketer-performance",
    "praise",
  ]);
  const source = Array.isArray(value) && value.length ? value : defaultRankingSettings;
  const normalized = source
    .map((item, index) => {
      const fallback = defaultRankingSettings[index] || defaultRankingSettings[0];
      const missionIds = Array.isArray(item?.missionIds)
        ? item.missionIds
        : [item?.missionId || fallback?.missionIds?.[0] || "praise"];
      return {
        id: String(item?.id || fallback?.id || `ranking-${index + 1}`).trim(),
        title: String(item?.title || fallback?.title || "").trim(),
        role: ["all", "hall", "kitchen", "marketer"].includes(item?.role) ? item.role : (fallback?.role || "all"),
        missionIds: missionIds.map((id) => String(id || "").trim()).filter((id) => allowedIds.has(id)).slice(0, 4),
        enabled: toBoolean(item?.enabled, true),
        cheer: String(item?.cheer || fallback?.cheer || "").trim(),
        monthlyTrophy: toBoolean(item?.monthlyTrophy, true),
        mark: String(item?.mark || fallback?.mark || "🏆").trim().slice(0, 4),
      };
    })
    .filter((item) => item.id && item.title && item.missionIds.length);
  return normalized.length ? normalized : defaultRankingSettings.map((item) => ({ ...item, missionIds: [...item.missionIds] }));
}

function normalizeCustomQuests(value) {
  const source = Array.isArray(value) ? value : defaultStoreSettings.customQuests;
  return source
    .map((quest, index) => ({
      id: String(quest?.id || `custom-${index + 1}`).trim(),
      title: String(quest?.title || "").trim(),
      points: clampPerformancePoints(quest?.points ?? quest?.xp ?? 1),
      enabled: toBoolean(quest?.enabled, true),
    }))
    .filter((quest) => quest.id && quest.title);
}

function normalizeCustomQuestPerformanceItems(value) {
  return normalizeCustomQuests(value)
    .filter((quest) => quest.enabled)
    .map((quest, index) => ({
      id: `customQuest-${slugifyQuestId(quest.id || quest.title || index)}`,
      role: "hall",
      ko: quest.title,
      vi: quest.title,
      xp: quest.points,
      max: 1,
      customQuest: true,
    }));
}

function slugifyQuestId(value) {
  const slug = String(value || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || `quest-${Date.now()}`;
}

function clampPerformancePoints(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return 1;
  return Math.min(99, Math.max(1, parsed));
}

function toBoolean(value, fallback = true) {
  if (value === true || value === false) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["false", "0", "off", "no"].includes(normalized)) return false;
    if (["true", "1", "on", "yes"].includes(normalized)) return true;
  }
  if (typeof value === "number") return value !== 0;
  return fallback;
}

function normalizeQuestSettings(settings) {
  return { ...defaultStoreSettings.questSettings, ...(settings || {}) };
}

function normalizeOperationPoints(points) {
  const source = Array.isArray(points) ? points : defaultStoreSettings.operationPoints;
  const normalized = source
    .map((point) => String(point || "").trim())
    .filter(Boolean)
    .slice(0, 6);
  return normalized.length ? normalized : defaultStoreSettings.operationPoints;
}

function normalizeTeamChallengeSettings(value) {
  const fallback = defaultStoreSettings.teamChallengeSettings;
  const target = Number.parseInt(value?.primaryTarget ?? fallback.primaryTarget, 10);
  return {
    enabled: toBoolean(value?.enabled, true),
    title: String(value?.title || fallback.title).trim(),
    primaryLabel: String(value?.primaryLabel || fallback.primaryLabel).trim(),
    primaryTarget: Number.isFinite(target) ? Math.min(999, Math.max(1, target)) : fallback.primaryTarget,
    secondaryLabel: String(value?.secondaryLabel || fallback.secondaryLabel).trim(),
  };
}

function normalizeOptionalOperationPoints(points) {
  const source = Array.isArray(points) ? points : [];
  return source
    .map((point) => String(point || "").trim())
    .filter(Boolean)
    .slice(0, 6);
}

function effectiveOperationPoints() {
  const settings = normalizeStoreSettings(state.storeSettings);
  const dailyPoints = normalizeOptionalOperationPoints(settings.dailyOperationPoints);
  const currentDate = els.date?.value || toInputDate(new Date());
  const isTodayBriefing = dailyPoints.length > 0 && settings.dailyOperationDate === currentDate;
  return isTodayBriefing ? dailyPoints : [];
}

function operationPointMode() {
  const settings = normalizeStoreSettings(state.storeSettings);
  const dailyPoints = normalizeOptionalOperationPoints(settings.dailyOperationPoints);
  const currentDate = els.date?.value || toInputDate(new Date());
  const isTodayBriefing = dailyPoints.length > 0 && settings.dailyOperationDate === currentDate;
  return {
    isDaily: isTodayBriefing,
    label: isTodayBriefing ? "today" : "basic",
  };
}

function questEnabled(key) {
  return normalizeQuestSettings(state.storeSettings?.questSettings)[key] !== false;
}

function visibleStaffName(person, index) {
  return String(person.name || "").trim() || fallbackStaffName(person.role, index);
}

function fallbackStaffName(role, index) {
  const prefix = isMarketerRole(role) ? "마케터" : isKitchenRole(role) ? "주방 직원" : "홀 직원";
  return `${prefix} ${index + 1}`;
}

function normalizeRole(role) {
  if (["hall-manager", "hall", "hall-part", "kitchen-manager", "kitchen", "kitchen-part", "marketer"].includes(role)) return role;
  if (role === "manager") return "hall-manager";
  if (role === "주방") return "kitchen";
  if (role === "마케터" || role === "marketing") return "marketer";
  if (role === "파트타임" || role === "홀") return "hall";
  return "hall";
}

function activeStaff() {
  return staff.filter((person) => person.active !== false);
}

function isScheduledWorkDay(person, date) {
  if (!person || !date) return false;
  if (isOffDay(person, date)) return false;
  const day = parseLocalDate(date).getDay();
  return normalizeWorkDays(person.workDays).includes(day);
}

function isOffDay(person, date) {
  return Boolean(date && Array.isArray(person.offDays) && person.offDays.includes(date));
}

function normalizeWorkDays(days) {
  if (!Array.isArray(days) || !days.length) return [...allWorkDays];
  return [...new Set(days.map(Number).filter((day) => day >= 0 && day <= 6))].sort((a, b) => a - b);
}

function normalizeOffDays(days) {
  if (!Array.isArray(days)) return [];
  return [...new Set(days.filter(Boolean))].sort();
}

function isHallRole(role) {
  return role === "hall" || role === "hall-manager" || role === "hall-part";
}

function isKitchenRole(role) {
  return role === "kitchen" || role === "kitchen-manager" || role === "kitchen-part";
}

function isMarketerRole(role) {
  return role === "marketer";
}

function isManagerRole(role) {
  return role === "hall-manager" || role === "kitchen-manager";
}

function roleLabel(role) {
  const labels = {
    "hall-manager": t("roleHallManager"),
    hall: t("roleHall"),
    "hall-part": t("roleHallPart"),
    "kitchen-manager": t("roleKitchenManager"),
    kitchen: t("roleKitchen"),
    "kitchen-part": t("roleKitchenPart"),
    marketer: t("roleMarketer"),
  };
  return labels[role] || t("roleHall");
}

function setLanguage(lang) {
  currentLang = lang === "vi" ? "vi" : "ko";
  localStorage.setItem(langStorageKey, currentLang);
  applyLanguage();
  renderStaffOptions();
  updateRoleFields();
  renderHistory();
  renderRankings();
  renderAnnouncement();
  renderAttendanceTime();
  renderCheckoutTime();
  renderEmployeeTabPanel(els.employeePhone?.getAttribute("data-active-tab") || "home");
  updateQuestProgress();
}

function applyLanguage() {
  document.documentElement.lang = currentLang;
  document.title = "Levelove - Level up with love";
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });
  els.langButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.lang === currentLang);
    if (button.dataset.lang === "ko") {
      button.textContent = currentLang === "vi" ? "Tiếng Hàn" : "한국어";
    }
    if (button.dataset.lang === "vi") {
      button.textContent = "Tiếng Việt";
    }
  });
  document.querySelector(".language-switch")?.setAttribute("aria-label", t("languageAria"));
  document.querySelector(".quest-stats")?.setAttribute("aria-label", t("questStatsAria"));
  document.querySelector(".mobile-tabbar")?.setAttribute("aria-label", t("employeeMenuAria"));
  els.operationPointList?.setAttribute("aria-label", t("operationPointsAria"));
  els.cleanStatus?.setAttribute("aria-label", t("cleanStatusAria"));
  if (els.hatiToast && !els.hatiToast.classList.contains("is-visible")) {
    els.hatiToastTitle.textContent = t("hatiToastTitleDefault");
    els.hatiToastMessage.textContent = t("hatiToastMessageDefault");
  }
  renderPerformanceCards();
  renderPraiseTargetOptions();
  renderSpecialCleanOptions();
  updateEmployeeTabLabels();
}

function updateEmployeeTabLabels() {
  const isKitchen = isKitchenRole(selectedStaff()?.role);
  const isMarketer = isMarketerRole(selectedStaff()?.role);
  const tabLabels = currentLang === "vi"
    ? { home: "Home", checkin: "Vào ca", mission: "Tan ca", performance: isMarketer ? "Marketing" : isKitchen ? "Đóng góp" : "Thành tích", ranking: "Xếp hạng", my: "Tôi" }
    : { home: "홈", checkin: "출근", mission: "퇴근", performance: isMarketer ? "마케팅" : isKitchen ? "기여" : "성과", ranking: "랭킹", my: "마이" };
  els.employeeTabButtons.forEach((button) => {
    button.textContent = tabLabels[button.dataset.employeeTab] || button.textContent;
  });
}

function helpTypeLabel(value) {
  const praiseTarget = activeStaff().find((person) => person.id === value);
  if (praiseTarget) {
    return currentLang === "vi"
      ? `Khen ${visibleStaffName(praiseTarget, 0)}`
      : `${visibleStaffName(praiseTarget, 0)} 칭찬`;
  }
  const labels = {
    "": { ko: "없음", vi: "Không có" },
    "홀 지원": { ko: "홀 지원", vi: "Hỗ trợ phục vụ" },
    "주방 지원": { ko: "주방 지원", vi: "Hỗ trợ bếp" },
    "청소 지원": { ko: "청소 지원", vi: "Hỗ trợ vệ sinh" },
    "재료/물품 정리": { ko: "재료/물품 정리", vi: "Sắp xếp nguyên liệu / đồ dùng" },
    "피크타임 지원": { ko: "피크타임 지원", vi: "Hỗ trợ giờ cao điểm" },
  };
  return labels[value]?.[currentLang] || value;
}

function praiseReasonLabel(value) {
  const labels = {
    peak: { ko: "피크타임 지원", vi: "Hỗ trợ giờ cao điểm" },
    cleaning: { ko: "정리/청소 지원", vi: "Hỗ trợ dọn dẹp / vệ sinh" },
    service: { ko: "홀/주방 흐름 지원", vi: "Hỗ trợ luồng phục vụ / bếp" },
    problem: { ko: "문제 해결 지원", vi: "Hỗ trợ xử lý vấn đề" },
    mood: { ko: "좋은 분위기", vi: "Tạo không khí tốt" },
  };
  return labels[value]?.[currentLang] || value || "";
}

function t(key) {
  return translations[currentLang]?.[key] || translations.ko[key] || key;
}

function uniqueId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `self-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function toInputDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function urlDateParam() {
  const value = pageParams.get("date") || pageParams.get("testDate");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(value || ""))) return "";
  const parsed = parseLocalDate(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return toInputDate(parsed) === value ? value : "";
}

function formatClockTime(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function toMonthInput(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function parseLocalDate(value) {
  const [year, month, day] = String(value).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function monthEntries(entries, month) {
  return entries.filter((entry) => entry.date?.startsWith(month));
}

function recentEntries(entries, days) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  const startKey = toInputDate(start);
  const endKey = toInputDate(end);
  return entries.filter((entry) => entry.date >= startKey && entry.date <= endKey);
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatScore(value) {
  const score = Number(value || 0).toFixed(1).replace(".0", "");
  return currentLang === "vi" ? `${score} điểm` : `${score}점`;
}

function kpiStatus(score) {
  if (score >= 9.5) return t("statusMvp");
  if (score >= 9) return t("statusGood");
  if (score >= 8.5) return t("statusStable");
  return t("statusWarning");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
