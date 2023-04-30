import { yupResolver } from '@hookform/resolvers/yup';
import { Delete, Edit, ImageSearchOutlined } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import {
  FormControlLabel,
  IconButton,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import { styled } from '@mui/material/styles';
import { visuallyHidden } from '@mui/utils';
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Confirmation, ErrorView, Loading } from 'src/components';
import EmptyTableView from 'src/components/empty-table-view';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import {
  addNewProductCategoryData,
  changeMasterProductCategoryReducer,
  deleteProductCategoryData,
  editProductCategoryData,
  getMasterProductCategoryData,
  getProductCategoryDetailData,
} from 'src/store/actions/masters-action/product-category-action';
import { useDebounce } from 'usehooks-ts';
import * as yup from 'yup';

// const SUPPORTED_FORMATS = ['image/jpg', 'image/jpeg', 'image/png'];

const productCategorySchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  link: yup.string().required('Link is required'),
  image: yup.mixed().required('Image file is required'),
});

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}));

export interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

function BootstrapDialogTitle(props: DialogTitleProps) {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
}

interface Data {
  id: number;
  name: string;
  image: string;
  link: string;
  deleted: boolean;
  background: string;
  created_who: string;
  updated_who?: string;
}

function createData(
  id: number,
  name: string,
  image: string,
  link: string,
  deleted: boolean,
  background: string,
  created_who: string,
  updated_who?: string
): Data {
  return {
    id,
    name,
    image,
    link,
    deleted,
    background,
    created_who,
    updated_who,
  };
}

type Order = 'asc' | 'desc';

interface HeadCell {
  disablePadding: boolean;
  id: keyof Data;
  label: string;
  align?: 'left' | 'right' | 'center';
  disableSort: boolean;
}

const headCells: readonly HeadCell[] = [
  {
    id: 'id',
    disablePadding: true,
    label: 'ID',
    align: 'center',
    disableSort: false,
  },
  {
    id: 'name',
    disablePadding: false,
    label: 'Name',
    disableSort: false,
  },
  {
    id: 'link',
    disablePadding: false,
    label: 'Link',
    disableSort: false,
  },
  {
    id: 'background',
    disablePadding: false,
    label: 'Background',
    disableSort: true,
    align: 'center',
  },
  {
    id: 'image',
    disablePadding: false,
    label: 'Image',
    disableSort: true,
  },
  {
    id: 'deleted',
    disablePadding: false,
    label: 'Visible',
    align: 'center',
    disableSort: false,
  },
  {
    id: 'created_who',
    disablePadding: false,
    label: 'Created By',
    disableSort: false,
  },
  {
    id: 'updated_who',
    disablePadding: false,
    label: 'Updated By',
    disableSort: false,
  },
  {
    id: 'id',
    disablePadding: false,
    label: 'Action',
    align: 'center',
    disableSort: true,
  },
];

interface EnhancedTableProps {
  onRequestSort: (
    event: React.MouseEvent<unknown>,
    newOrderBy: keyof Data
  ) => void;
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { order, orderBy, onRequestSort } = props;
  const createSortHandler =
    (newOrderBy: keyof Data) => (event: React.MouseEvent<unknown>) => {
      onRequestSort(event, newOrderBy);
    };

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.label}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            {!headCell.disableSort ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : 'asc'}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {!headCell.disableSort && orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === 'desc'
                      ? 'sorted descending'
                      : 'sorted ascending'}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

type FormType = {
  id: number;
  name: string;
  background: string;
  image: string | File;
  link: string;
  visible: boolean;
};

const ProductCategory = () => {
  const dispatch = useAppDispatch();
  const {
    data,
    page,
    sortBy,
    sortType,
    limit,
    total,
    search,
    loadingPost,
    loadingDelete,
    loading,
    error,
  } = useAppSelector((state) => state.masterProductCategoryReducer);
  const isMount = useRef<boolean>(true);

  const debouncedSearchTerm: string = useDebounce<string>(search || '', 500);

  const [openFormDialog, setOpenFormDialog] = useState<boolean>(false);
  const [openDeleteConfirmation, setOpenDeleteConfirmation] =
    useState<boolean>(false);
  const [openEditConfirmation, setOpenEditConfirmation] =
    useState<boolean>(false);
  const [openImagePreview, setOpenImagePreview] = useState<boolean>(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState<string>('');
  const [editForm, setEditForm] = useState<boolean>(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const formMethods = useForm<FormType>({
    mode: 'onChange',
    defaultValues: {
      id: 0,
      name: '',
      background: '#000000',
      image: '',
      link: '',
      visible: false,
    },
    resolver: yupResolver(productCategorySchema),
  });

  const { control, formState, handleSubmit, reset } = formMethods;
  const { errors } = formState;

  const handleClickOpen = () => {
    setOpenFormDialog(true);
  };
  const handleClose = () => {
    if (editForm) {
      setEditForm(false);
    }
    setOpenFormDialog(false);
    reset({
      id: 0,
      name: '',
      background: '#000000',
      image: '',
      link: '',
      visible: false,
    });
  };

  const handleEditConfirmation = handleSubmit(() => {
    setOpenEditConfirmation(true);
  });

  const onSubmit = handleSubmit(async (data: FormType) => {
    const formData = await new FormData();
    formData.append('name', data.name);
    formData.append('background', data.background);
    formData.append('link', data.link);
    formData.append('image', data?.image || '');
    formData.append('visible', data.visible ? 'true' : 'false');

    let response: boolean;
    if (editForm) {
      response = await dispatch(editProductCategoryData(data?.id, formData));
      if (response) {
        handleClose();
        setOpenEditConfirmation(false);
        setSelectedId(null);
        dispatch(getMasterProductCategoryData());
      }
    } else {
      response = await dispatch(addNewProductCategoryData(formData));
      if (response) {
        handleClose();
        dispatch(getMasterProductCategoryData());
      }
    }
  });

  const handleGetData = useCallback(async () => {
    dispatch(getMasterProductCategoryData());
  }, [dispatch]);

  useEffect(() => {
    if (isMount.current) {
      handleGetData();
      isMount.current = false;
    }
  }, [handleGetData]);

  useEffect(
    () => {
      if (debouncedSearchTerm) {
        dispatch(getMasterProductCategoryData());
      }
    },
    [debouncedSearchTerm] // Only call effect if debounced search term changes
  );

  const rows = data?.map((row: Data) =>
    createData(
      row?.id,
      row?.name,
      row?.image,
      row?.link,
      row?.deleted,
      row?.background,
      row?.created_who,
      row?.updated_who
    )
  );

  const handleRequestSort = React.useCallback(
    (event: React.MouseEvent<unknown>, newOrderBy: keyof Data) => {
      const isAsc = sortBy === newOrderBy && sortType === 'asc';
      const toggledOrder = isAsc ? 'desc' : 'asc';

      dispatch(
        changeMasterProductCategoryReducer({
          sortBy: newOrderBy,
          sortType: toggledOrder,
        })
      );
      dispatch(getMasterProductCategoryData());
    },

    [sortType, sortBy, dispatch]
  );

  const handleChangePage = React.useCallback(
    (event: unknown, newPage: number) => {
      dispatch(
        changeMasterProductCategoryReducer({
          page: newPage,
        })
      );
      dispatch(getMasterProductCategoryData());
    },
    [dispatch, page]
  );

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(
      changeMasterProductCategoryReducer({
        page: 0,
        limit: +event.target.value,
      })
    );
    dispatch(getMasterProductCategoryData());
  };

  const handleDeleteData = async (id: number) => {
    const response = await dispatch(deleteProductCategoryData(id));
    if (response) {
      dispatch(getMasterProductCategoryData());
      setOpenDeleteConfirmation(false);
      setSelectedId(null);
    }
  };

  const productCategoryImage = useWatch({ control, name: 'image' });

  return (
    <>
      <section className="p-4 bg-gray-200 w-full rounded-md">
        <div className="flex flex-col xl:flex-row gap-4">
          <input
            className="rounded-md px-3 py-2 border-2 border-gray-600 w-full"
            type="search"
            placeholder="Cari data..."
            onChange={(e: React.FormEvent<HTMLInputElement>) =>
              dispatch(
                changeMasterProductCategoryReducer({
                  search: (e.target as HTMLInputElement).value,
                  page: 0,
                })
              )
            }
          />
        </div>
      </section>
      <main className="flex flex-col gap-6">
        <div className="flex justify-between gap-4 items-center">
          <div>
            <Typography fontWeight={'bold'} variant="h6">
              Master Kategori Produk
            </Typography>
            <Typography variant="body1">
              Manajemen daftar kategori produk
            </Typography>
          </div>
          <Button
            color="success"
            size="small"
            variant="contained"
            onClick={handleClickOpen}
          >
            Tambah Data
          </Button>
        </div>
        <section>
          {loading ? (
            <Loading />
          ) : error ? (
            <ErrorView
              message={error || ''}
              handleRetry={() => {
                dispatch(
                  changeMasterProductCategoryReducer({
                    page: 0,
                    sortBy: 'deleted',
                  })
                );
                dispatch(getMasterProductCategoryData());
              }}
            />
          ) : rows?.length === 0 ? (
            <EmptyTableView />
          ) : (
            <Paper sx={{ width: '100%' }}>
              <TableContainer>
                <Table
                  sx={{ minWidth: 750 }}
                  aria-labelledby="tableTitle"
                  size={'medium'}
                >
                  <EnhancedTableHead
                    order={sortType || 'asc'}
                    orderBy={sortBy || 'deleted'}
                    onRequestSort={handleRequestSort}
                  />
                  <TableBody>
                    {rows?.map((row, index) => {
                      const labelId = `enhanced-table-checkbox-${index}`;

                      return (
                        <TableRow hover tabIndex={-1} key={row.id}>
                          <TableCell
                            align="center"
                            component="th"
                            id={labelId}
                            scope="row"
                          >
                            {row.id}
                          </TableCell>
                          <TableCell align="left">{row.name || '-'}</TableCell>
                          <TableCell align="left">{row.link || '-'}</TableCell>
                          <TableCell align="center">
                            {row.background ? (
                              <div
                                title={row?.background}
                                style={{ backgroundColor: row.background }}
                                className="w-10 h-8 rounded-md mx-auto"
                              />
                            ) : (
                              '-'
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Preview">
                              <span>
                                <IconButton
                                  onClick={() => {
                                    setOpenImagePreview(true);
                                    setSelectedImagePreview(row.image);
                                  }}
                                  size="small"
                                  aria-label="preview"
                                  color="info"
                                >
                                  <ImageSearchOutlined fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            {!row.deleted ? (
                              <CheckCircleIcon
                                titleAccess="Tersedia"
                                fontSize="small"
                                color="success"
                              />
                            ) : (
                              <CancelIcon
                                titleAccess="Dihapus"
                                fontSize="small"
                                color="error"
                              />
                            )}
                          </TableCell>
                          <TableCell align="left">
                            {row.created_who || '-'}
                          </TableCell>
                          <TableCell align="left">
                            {row.updated_who || '-'}
                          </TableCell>
                          <TableCell align="center">
                            <section className="flex items-center gap-2">
                              <Tooltip title="Hapus">
                                <span>
                                  <IconButton
                                    onClick={() => {
                                      setSelectedId(row.id);
                                      setOpenDeleteConfirmation(true);
                                    }}
                                    size="small"
                                    aria-label="delete"
                                    color="error"
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <span>
                                  <IconButton
                                    onClick={async () => {
                                      const response = await dispatch(
                                        getProductCategoryDetailData(row.id)
                                      );
                                      if (Object.keys(response).length > 0) {
                                        setSelectedId(response?.id);
                                        setEditForm(true);
                                        reset({
                                          id: response?.id,
                                          name: response?.name || '',
                                          image: response?.image || '',
                                          link: response?.link || '',
                                          visible: response?.visible || false,
                                          background:
                                            response?.background || '#000000',
                                        });
                                        handleClickOpen();
                                      }
                                    }}
                                    size="small"
                                    aria-label="edit"
                                  >
                                    <Edit fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            </section>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50, 100]}
                component="div"
                count={total || 0}
                rowsPerPage={limit || 5}
                page={page || 0}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          )}
        </section>
      </main>
      {openFormDialog && (
        <BootstrapDialog
          aria-labelledby="customized-dialog-title"
          open={openFormDialog}
          maxWidth="md"
          fullWidth
        >
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={handleClose}
          >
            {editForm
              ? 'Edit Data Kategori Produk'
              : 'Data Kategori Produk Baru'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex-col flex gap-4 w-full mb-8">
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Name</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type product category name"
                        helperText={errors?.name && errors.name?.message}
                        error={!!errors?.name}
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="link"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">Link</label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type product category link"
                        helperText={errors?.link && errors.link?.message}
                        error={!!errors?.link}
                      />
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="background"
                  render={({ field }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">
                        Background
                      </label>
                      <TextField
                        {...field}
                        fullWidth
                        placeholder="Type product category background"
                        helperText={
                          errors?.background && errors.background?.message
                        }
                        error={!!errors?.background}
                        type="color"
                      />
                    </div>
                  )}
                />
                <Controller
                  control={control}
                  name="image"
                  render={({ field: { onChange, ...field } }) => (
                    <div className="flex flex-col gap-3 w-full">
                      <label className="text-sm font-semibold">
                        Choose Image
                      </label>
                      <section className="flex gap-3 items-stretch">
                        <TextField
                          //   {...field}
                          onChange={(event: ChangeEvent) => {
                            const target = event.target as HTMLInputElement;
                            const file: File = (target.files as FileList)[0];
                            onChange(file);
                          }}
                          placeholder="Type product category image"
                          helperText={errors?.image && errors.image?.message}
                          error={!!errors?.image}
                          type="file"
                          fullWidth
                          inputProps={{
                            accept: 'image/png, image/jpg, image/jpeg',
                          }}
                        />
                        {productCategoryImage && (
                          <img
                            src={
                              typeof productCategoryImage === 'string'
                                ? productCategoryImage
                                : productCategoryImage instanceof Blob
                                ? URL.createObjectURL(productCategoryImage)
                                : ''
                            }
                            alt="product-preview"
                            className=" w-14 p-2 bg-slate-100 rounded-md object-contain"
                          />
                        )}
                      </section>
                    </div>
                  )}
                />
              </div>
              <div className="flex flex-col lg:flex-row items-stretch gap-4 w-full">
                <Controller
                  control={control}
                  name="visible"
                  render={({ field: { onChange, value, ...field } }) => (
                    <div className="flex flex-col gap-3">
                      <label className="text-sm font-semibold">Visible</label>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={value || false}
                            onChange={(e) => {
                              onChange(e.target.checked);
                            }}
                            name="visible"
                          />
                        }
                        label={value ? 'SHOW' : 'HIDE'}
                      />
                    </div>
                  )}
                />
              </div>
            </section>
          </DialogContent>
          <DialogActions>
            <Button
              disabled={loadingPost}
              color="inherit"
              onClick={handleClose}
            >
              Batal
            </Button>
            <Button
              disabled={loadingPost}
              variant="contained"
              onClick={() => {
                if (editForm) {
                  handleEditConfirmation();
                } else {
                  onSubmit();
                }
              }}
            >
              Simpan
            </Button>
          </DialogActions>
        </BootstrapDialog>
      )}
      {openDeleteConfirmation && (
        <Confirmation
          open={openDeleteConfirmation}
          title={'Hapus data kategori produk?'}
          content={`Konfirmasi untuk menghapus data kategori produk dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenDeleteConfirmation(false)}
          confirmActionHandler={() => handleDeleteData(selectedId || 0)}
          loading={loadingDelete || false}
          loadingText={'Menghapus'}
          confirmActionText={'Hapus'}
          cancelActionText={'Batal'}
          type="error"
        />
      )}
      {openEditConfirmation && (
        <Confirmation
          open={openEditConfirmation}
          title={'Ubah data kategori produk?'}
          content={`Konfirmasi untuk mengubah data kategori produk dengan id ${selectedId}.`}
          cancelActionHandler={() => setOpenEditConfirmation(false)}
          confirmActionHandler={onSubmit}
          loading={loadingPost || false}
          loadingText={'Mengubah'}
          confirmActionText={'OK'}
          cancelActionText={'Batal'}
          type="primary"
        />
      )}
      {openImagePreview && (
        <BootstrapDialog
          onClose={() => {
            setSelectedImagePreview('');
            setOpenImagePreview(false);
          }}
          aria-labelledby="customized-dialog-title"
          open={openImagePreview}
          maxWidth="sm"
          fullWidth
        >
          <BootstrapDialogTitle
            id="customized-dialog-title"
            onClose={() => {
              setSelectedImagePreview('');
              setOpenImagePreview(false);
            }}
          >
            {'Image Preview'}
          </BootstrapDialogTitle>
          <DialogContent dividers>
            <section className="flex flex-col items-center justify-center h-[240px]">
              <img
                alt="preview"
                className="w-full h-full p-1 object-scale-down"
                src={selectedImagePreview}
              />
            </section>
          </DialogContent>
        </BootstrapDialog>
      )}
    </>
  );
};

export default ProductCategory;
