import { Icon } from '@iconify/react';
import { useState } from 'react';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Grid, Card, Typography, CardContent, Paper } from '@material-ui/core';
import LightboxModal from 'src/components/LightboxModal';
import Analytics from '../../../../../../../../images/content-student-graph.png'

// ----------------------------------------------------------------------

const CaptionStyle = styled(CardContent)(({ theme }) => ({
  bottom: 0,
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  position: 'absolute',
  backdropFilter: 'blur(3px)',
  WebkitBackdropFilter: 'blur(3px)', // Fix on Mobile
  justifyContent: 'space-between',
  color: theme.palette.common.white,
  backgroundColor: alpha(theme.palette.grey[900], 0.72),
  borderBottomLeftRadius: theme.shape.borderRadiusMd,
  borderBottomRightRadius: theme.shape.borderRadiusMd
}));

const GalleryImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

// ----------------------------------------------------------------------

function GalleryItem({ image, onOpenLightbox }) {
  const imageUrl = image;
  return (
      <GalleryImgStyle alt="gallery image" src={imageUrl} onClick={() => onOpenLightbox(imageUrl)} />
  );
}

export default function AnalyticsImage({values,data}) {
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const image = values;

  const imagesLightbox = [image];

  const handleOpenLightbox = (url) => {
    setSelectedImage(0);
    setOpenLightbox(true);
  };

  return (
    <Box>
        <Typography variant="subtitle1" sx={{ mb: 3 ,mt:3}}>
          {data?"Analytics Graph Image :":"Marksheet Image :"}
        </Typography>
      <Paper variant='outlined' sx={{ p: 2,}}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={12} md={7.5}>
            <GalleryItem image={image} onOpenLightbox={handleOpenLightbox} />
          </Grid>
        </Grid>

        <LightboxModal
          images={imagesLightbox}
          photoIndex={selectedImage}
          setPhotoIndex={setSelectedImage}
          isOpen={openLightbox}
          onClose={() => setOpenLightbox(false)}
        />
      </Paper>
      </Box>
  );
}
