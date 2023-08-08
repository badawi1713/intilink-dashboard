import { Box, FormControlLabel, ListItem, ListItemText, Switch, Typography } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { FC, memo, useState } from 'react';
import { Confirmation } from 'src/components';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { verifyUserData } from 'src/store/actions/masters-action/users-action';

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
    <Dialog fullWidth={true} maxWidth={'xl'} open={open} onClose={handleClose}>
      <DialogTitle>Verifikasi User</DialogTitle>
      <DialogContent dividers>
        <section className="flex flex-col lg:flex-row w-full mb-8">
          <div className="flex flex-row items-stretch">
            <ListItem className="p-0">
              <ListItemText
                primary="Foto Selfie dengan KTP"
                secondary={
                  <Box
                    component="img"
                    sx={{
                      height: 225,
                      width: 200,
                      mt: 1,
                    }}
                    src={`${userVerificationData?.foto_selfie}?w=164&h=164&fit=crop&auto=format`}
                    srcSet={`${userVerificationData?.foto_selfie}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    alt={`${userVerificationData?.nama_ktp}_ktp`}
                    loading="lazy"
                  />
                }
              />
            </ListItem>
            <ListItem className="p-0">
              <ListItemText
                primary="Foto Identitas (KTP)"
                secondary={
                  <Box
                    component="img"
                    sx={{
                      height: 170,
                      width: 300,
                      mt: 1,
                    }}
                    src={`${userVerificationData?.foto_ktp}?w=164&h=164&fit=crop&auto=format`}
                    srcSet={`${userVerificationData?.foto_ktp}?w=164&h=164&fit=crop&auto=format&dpr=2 2x`}
                    alt={`${userVerificationData?.nama_ktp}_ktp`}
                    loading="lazy"
                  />
                }
              />
            </ListItem>
          </div>
          <section className="flex flex-col flex-1">
            <div className="flex flex-col md:flex-row items-start md:items-stretch">
              <ListItem className="p-0">
                <ListItemText
                  primary="Nama Lengkap"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.nama_ktp || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Jenis Kelamin"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.jenis_kelamin || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="No. Identitas (KTP)"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.no_ktp || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Nama Ibu"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.nama_ibu || '-'}
                    </Typography>
                  }
                />
              </ListItem>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-stretch">
              <ListItem className="p-0">
                <ListItemText
                  primary="Provinsi"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.provinsi || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Kota/Kabupaten"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.kota_kab || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Kecamatan"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.kecamatan || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Kelurahan"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.kelurahan || '-'}
                    </Typography>
                  }
                />
              </ListItem>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-stretch">
              <ListItem className="p-0">
                <ListItemText
                  primary="No. Whatsapp"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.no_wa || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Email"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.email || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Alamat"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.alamat_ktp || '-'}
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem className="p-0">
                <ListItemText
                  primary="Kode POS"
                  secondary={
                    <Typography fontWeight={500} variant="body2" color="text.primary">
                      {userVerificationData?.kode_pos || '-'}
                    </Typography>
                  }
                />
              </ListItem>
            </div>
            <div className="flex flex-col md:flex-row items-start md:items-stretch">
              <ListItem className="p-0">
                <ListItemText
                  primary="Verifikasi Akun"
                  secondary={
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
                  }
                />
              </ListItem>
            </div>
          </section>
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
