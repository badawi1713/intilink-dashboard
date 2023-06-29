import { FC, memo, useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { verifyUserData } from 'src/store/actions/masters-action/users-action';
import { Confirmation } from 'src/components';

type UserVerificationDetailProps = {
  open: boolean;
  handleClose: () => void;
};

const UserVerificationDetail: FC<UserVerificationDetailProps> = ({ open, handleClose }) => {
  const dispatch = useAppDispatch();
  const { userVerificationData, zonapayId, loadingPost } = useAppSelector((state) => state.masterUsersReducer);
  const [verify, setVerify] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState(false);

  const handleSubmit = async () => {
    const data = {
      zonapayId: zonapayId || '',
      verify,
    };
    const response: any = await dispatch(verifyUserData(data));
    if (response) {
      handleClose();
      setOpenConfirmation(false);
    }
  };

  return (
    <Dialog fullWidth={true} maxWidth={'md'} open={open} onClose={handleClose}>
      <DialogTitle>Verifikasi User</DialogTitle>
      <DialogContent dividers>
        <section className="flex-col flex gap-4 w-full mb-8">
          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Nama Lengkap</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.nama_ktp || '-'} />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Jenis Kelamin</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.jenis_kelamin || '-'} />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">No. Whatsapp</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.no_wa || '-'} />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Email</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.email || '-'} />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">No. Identitas (KTP)</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.no_ktp || '-'} />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Nama Ibu</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.nama_ibu || '-'} />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Provinsi</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.provinsi || '-'} />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Kota/Kabupaten</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.kota_kab || '-'} />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Kecamatan</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.kecamatan || '-'} />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Kelurahan</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.kelurahan || '-'} />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Alamat</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.alamat_ktp || '-'} />
            </div>

            <div className="flex flex-col gap-3 w-full">
              <label className="text-sm font-semibold">Kode Pos</label>
              <TextField fullWidth placeholder="-" value={userVerificationData?.kode_pos || '-'} />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                  <Typography variant="body2" fontWeight={600}>
                    Foto Identitas (KTP)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <img
                    src={`${userVerificationData?.foto_ktp}?w=164&h=164&fit=crop&auto=format`}
                    srcSet={`${userVerificationData?.foto_ktp}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    alt={`${userVerificationData?.nama_ktp}_ktp`}
                    loading="lazy"
                  />
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
                  <Typography variant="body2" fontWeight={600}>
                    Foto Selfie dengan KTP
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <img
                    src={`${userVerificationData?.foto_selfie}?w=164&h=164&fit=crop&auto=format`}
                    srcSet={`${userVerificationData?.foto_selfie}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    alt={`${userVerificationData?.nama_ktp}_ktp`}
                    loading="lazy"
                  />
                </AccordionDetails>
              </Accordion>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-semibold">Verifikasi Akun</label>
              <FormControlLabel
                control={
                  <Switch
                    checked={verify || false}
                    onChange={(e) => {
                      setVerify(e.target.checked);
                    }}
                    name="verify"
                  />
                }
                label={verify ? 'Aktif' : 'Non-Aktif'}
              />
            </div>
          </div>
        </section>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" onClick={handleClose}>
          Batal
        </Button>
        <Button onClick={() => setOpenConfirmation(true)} variant="contained" color="success">
          Proses
        </Button>
      </DialogActions>
      {openConfirmation && (
        <Confirmation
          open={openConfirmation}
          title={`${verify ? 'Aktifkan' : 'Non-Aktifkan'} Akun User`}
          content={`Konfirmasi untuk ${verify ? 'aktifkan' : 'non-aktifkan'} akun user dengan id ${zonapayId}.`}
          cancelActionHandler={() => setOpenConfirmation(false)}
          confirmActionHandler={handleSubmit}
          loading={loadingPost || false}
          loadingText={'Memproses'}
          confirmActionText={'OK'}
          cancelActionText={'Batal'}
          type={verify ? 'success' : 'error'}
        />
      )}
    </Dialog>
  );
};

export default memo(UserVerificationDetail);
