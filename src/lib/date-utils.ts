import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const TJ = 'Asia/Tokyo';

export function getTodayJST(): string {
    return dayjs().tz(TJ).format('YYYY-MM-DD');
}

export function getYesterdayJST(): string {
    return dayjs().tz(TJ).subtract(1, 'day').format('YYYY-MM-DD');
}

export function getJSTDate(dateStr: string): dayjs.Dayjs {
    return dayjs(dateStr).tz(TJ);
}
