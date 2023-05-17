import { Add } from '@mui/icons-material';
import { Button, Typography } from '@mui/material';
import { FC, SyntheticEvent, useRef, useState } from 'react';
import { Accordion, AccordionDetails, AccordionSummary } from '../accordion/Accordion';

type AsideProps = {
  setOpenAside: (value: boolean) => void;
  openAside: boolean;
};

const Aside: FC<AsideProps> = ({ openAside, setOpenAside }) => {
  const asideRef = useRef(null);

  const [expanded, setExpanded] = useState<string | false>(false);

  const handleChange = (panel: string) => (event: SyntheticEvent, newExpanded: boolean) => {
    setExpanded(newExpanded ? panel : false);
  };

  const handleClickOutside = () => {
    setOpenAside(false);
  };

  return (
    <>
      {openAside && (
        <>
          <div onClick={handleClickOutside} className="z-10 absolute xl:hidden w-full h-full bg-black bg-opacity-50" />
          <aside
            ref={asideRef}
            className="absolute z-20 xl:sticky px-10 py-16 bg-white shadow-lg w-full max-w-xs xl:max-w-full border min-h-full"
          >
            <img
              alt="intilink-logo"
              src={`${window.location.origin}/assets/images/img-logo.png`}
              className="w-32 h-16 mb-8"
            />
            <section className="flex flex-col gap-6 items-start">
              <Button startIcon={<Add />} color="success" fullWidth variant="contained" className="w-auto">
                Add Sender
              </Button>
              <Accordion className="w-full" expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
                  <Typography>Whatsapp Sender</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography color="green">+62 812 5388 9122</Typography>
                </AccordionDetails>
              </Accordion>
            </section>
          </aside>
        </>
      )}
    </>
  );
};

export default Aside;
