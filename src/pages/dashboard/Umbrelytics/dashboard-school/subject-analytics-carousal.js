import Slider from 'react-slick';
import PropTypes from 'prop-types';
import { useState, useRef, useEffect, useCallback } from 'react';
// material
import { alpha, experimentalStyled as styled } from '@material-ui/core/styles';
import { Box, Tooltip, Typography } from '@material-ui/core';
import { CarouselControlsArrowsIndex } from 'src/components/carousel';
import LightboxModal from 'src/components/LightboxModal';
import 'react-image-lightbox/style.css';
import { MotionInView, varFadeInRight } from 'src/components/animate';
import { fDate } from 'src/utils/formatTime';

// ----------------------------------------------------------------------

const CAROUSELS = [
  {
    id: 1,
    image: 'https://cdn.boldbi.com/wp/pages/dashboards/education/school-performance-thumbnail-v1.webp',
    title: 'Mid Term Subject Analytics',
    postAt: '2023-06-15T12:00:00Z'
  },
  {
    id: 2,
    image: 'https://cdn.boldbi.com/wp/pages/dashboards/education/school-performance-thumbnail-v1.webp',
    title: 'Half Early Subject Analytics',
    postAt: '2023-07-01T10:30:00Z'
  },
  {
    id: 3,
    image: 'https://www.researchgate.net/publication/362190330/figure/fig1/AS:11431281095479016@1667913910006/Student-Interest-Analysis-Results-Graph-Based-on-Figure-3-the-average-of-the-five.png',
    title: 'Annual Subject Analytics',
    postAt: '2023-07-10T15:45:00Z'
  }
];

const THUMB_SIZE = 64;

const RootStyle = styled('div')(({ theme }) => {
  const isRTL = theme.direction === 'rtl';

  return {
    root: {
      '& .slick-slide': {
        float: isRTL ? 'right' : 'left'
      }
    }
  };
});

const LargeImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

const ThumbImgStyle = styled('img')(({ theme }) => ({
  opacity: 0.48,
  width: THUMB_SIZE,
  cursor: 'pointer',
  height: THUMB_SIZE,
  margin: theme.spacing(0, 1),
  borderRadius: theme.shape.borderRadiusSm,
  '&:hover': {
    opacity: 0.72,
    transition: theme.transitions.create('opacity')
  }
}));

const RootStyle1 = styled('div')(({ theme }) => ({
  position: 'absolute',
  bottom: 8,
  left: 8,
  zIndex: 999,
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  paddingBottom: theme.spacing(0.5),
  paddingTop: theme.spacing(0.5),
  flexDirection: 'column',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  color: theme.palette.common.white,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.grey[900], 0.48)
}));

// ----------------------------------------------------------------------

LargeItem.propTypes = {
  item: PropTypes.object,
  onClick: PropTypes.func,
  animationKey: PropTypes.number
};

function LargeItem({ item, onClick, animationKey }) {
  // const { image, title, postAt } = item;
  const {analyticsImage, analyticsName,analyticsuploadedTime} = item;


  return (
    <Box
      sx={{
        position: 'relative',
        paddingTop: {
          xs: '100%',
          md: '50%'
        }
      }}
    >
      <LargeImgStyle alt={analyticsName} src={analyticsImage} onClick={onClick} />
      <MotionInView key={animationKey} variants={varFadeInRight}>
        <RootStyle1>
          <Tooltip title={analyticsName}>
            <Typography variant='subtitle2' sx={{ maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{analyticsName}</Typography>
          </Tooltip>
          <Typography variant="caption">
            {/* {fDate(postAt)} */}
            {analyticsuploadedTime}
          </Typography>
        </RootStyle1>
      </MotionInView>
    </Box>
  );
}

ThumbnailItem.propTypes = {
  item: PropTypes.object
};

function ThumbnailItem({ item }) {
  // const { image, title } = item;
  const {analyticsImage, analyticsName } = item;


  return <ThumbImgStyle alt={analyticsName} src={analyticsImage} />;
}

export default function SubjectAnalyticsCarousel({data}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);
  const [openLightbox, setOpenLightbox] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const settings1 = {
    speed: 500,
    dots: false,
    arrows: false,
    slidesToShow: 1,
    draggable: false,
    slidesToScroll: 1,
    adaptiveHeight: true,
    beforeChange: (current, next) => {
      setCurrentIndex(next);
      setAnimationKey(prevKey => prevKey + 1); 
    }
  };

  const settings2 = {
    dots: false,
    arrows: false,
    centerMode: true,
    swipeToSlide: true,
    focusOnSelect: true,
    variableWidth: true,
    centerPadding: '0px',
    slidesToShow: data?.length 
  };

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  const handlePrevious = () => {
    slider2.current.slickPrev();
  };

  const handleNext = () => {
    slider2.current.slickNext();
  };

  const handleOpenLightbox = useCallback((index) => {
    setSelectedImage(index);
    setOpenLightbox(true);
  }, []);

  function handleLightBoxClose() {
    setOpenLightbox(false);
    window.location.reload();
  }

  const imagesLightbox = data?.map(item => item?.analyticsImage);

  return (
    <RootStyle>
      <Box
        sx={{
          zIndex: 0,
          borderRadius: 2,
          overflow: 'hidden',
          position: 'relative',
          border: (theme) => `solid 5px ${theme.palette.divider}`,
          cursor: 'pointer'
        }}
      >
        <Slider {...settings1} asNavFor={nav2} ref={slider1}>
          {data?.map((item, index) => (
            <LargeItem key={index} item={item} onClick={() => handleOpenLightbox(index)} animationKey={animationKey} />
          ))}
        </Slider>
        <CarouselControlsArrowsIndex
          index={currentIndex}
          total={data?.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </Box>

      <Box
        sx={{
          mt: 3,
          mx: 'auto',
          ...(data?.length === 1 && { maxWidth: THUMB_SIZE * 1 + 16 }),
          ...(data?.length === 2 && { maxWidth: THUMB_SIZE * 2 + 32 }),
          ...(data?.length === 3 && { maxWidth: THUMB_SIZE * 3 + 48 }),
          ...(data?.length === 4 && { maxWidth: THUMB_SIZE * 3 + 48 }),
          ...(data?.length === 5 && { maxWidth: THUMB_SIZE * 6 }),
          '& .slick-current img': {
            opacity: 1,
            border: (theme) => `solid 3px ${theme.palette.primary.main}`
          }
        }}
      >
        <Slider {...settings2} asNavFor={nav1} ref={slider2}>
          {data?.map((item, index) => (
            <ThumbnailItem key={index} item={item} />
          ))}
        </Slider>
      </Box>

      {openLightbox && (
        <LightboxModal
          images={imagesLightbox}
          photoIndex={selectedImage}
          setPhotoIndex={setSelectedImage}
          isOpen={openLightbox}
          onClose={handleLightBoxClose}
        />
      )}
    </RootStyle>
  );
}
