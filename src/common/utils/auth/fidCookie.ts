import Cookies from 'js-cookie';

const FID_COOKIE_NAME = 'nounspace_fid';
const FID_COOKIE_EXPIRY_DAYS = 7; // Cookie expires in 7 days

export const setFidCookie = (fid: number) => {
  Cookies.set(FID_COOKIE_NAME, fid.toString(), {
    expires: FID_COOKIE_EXPIRY_DAYS,
    secure: true,
    sameSite: 'strict'
  });
};

export const getFidCookie = (): number | null => {
  const fid = Cookies.get(FID_COOKIE_NAME);
  return fid ? parseInt(fid, 10) : null;
};

export const removeFidCookie = () => {
  Cookies.remove(FID_COOKIE_NAME);
}; 