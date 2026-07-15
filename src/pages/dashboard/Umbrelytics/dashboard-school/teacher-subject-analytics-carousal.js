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

// Static data array
const CAROUSELS = [
  {
    id: 1,
    image: 'https://www.researchgate.net/publication/317798300/figure/fig2/AS:508152673837056@1498164446854/Percentage-of-students-positive-to-academic-interest-by-level-of-satisfaction-with.png',
    title: 'Mid Term Subject Analytics',
    postAt: '2023-06-15T12:00:00Z'
  },
  {
    id: 2,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGXtN1V_KeHQbKr3ShEV2Qh3tWYqvE44A5pPNlhronF7YuJcD3gwBekijIo2VZ_c7pGqQ&usqp=CAU',
    title: 'Half Early Subject Analytics',
    postAt: '2023-07-01T10:30:00Z'
  },
  {
    id: 3,
    image: 'https://pub.mdpi-res.com/environments/environments-06-00081/article_deploy/html/images/environments-06-00081-g001.png?1564572397',
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
  const { image, title, postAt } = item;

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
      <LargeImgStyle alt={title} src={image} onClick={onClick} />
      <MotionInView key={animationKey} variants={varFadeInRight}>
        <RootStyle1>
          <Tooltip title={title}>
            <Typography variant='subtitle2' sx={{ maxWidth: 230, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</Typography>
          </Tooltip>
          <Typography variant="caption">
            {fDate(postAt)}
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
  const { image, title } = item;

  return <ThumbImgStyle alt={title} src={image} />;
}

export default function TeacherAnalyticsCarousel() {
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
    slidesToShow: CAROUSELS.length > 3 ? 3 : CAROUSELS.length
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

  const imagesLightbox = CAROUSELS.map(item => item.image);

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
          {CAROUSELS.map((item, index) => (
            <LargeItem key={index} item={item} onClick={() => handleOpenLightbox(index)} animationKey={animationKey} />
          ))}
        </Slider>
        <CarouselControlsArrowsIndex
          index={currentIndex}
          total={CAROUSELS.length}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </Box>

      <Box
        sx={{
          mt: 3,
          mx: 'auto',
          ...(CAROUSELS.length === 1 && { maxWidth: THUMB_SIZE * 1 + 16 }),
          ...(CAROUSELS.length === 2 && { maxWidth: THUMB_SIZE * 2 + 32 }),
          ...(CAROUSELS.length === 3 && { maxWidth: THUMB_SIZE * 3 + 48 }),
          ...(CAROUSELS.length === 4 && { maxWidth: THUMB_SIZE * 3 + 48 }),
          ...(CAROUSELS.length === 5 && { maxWidth: THUMB_SIZE * 6 }),
          '& .slick-current img': {
            opacity: 1,
            border: (theme) => `solid 3px ${theme.palette.primary.main}`
          }
        }}
      >
        <Slider {...settings2} asNavFor={nav1} ref={slider2}>
          {CAROUSELS.map((item, index) => (
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