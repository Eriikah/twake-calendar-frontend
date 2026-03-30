import { Box, Typography } from '@linagora/twake-mui'

export type AppIconProps = {
  name: string
  link: string
  icon: string
}

export function AppIcon({ prop }: { prop: AppIconProps }) {
  return (
    <Box
      component="a"
      href={prop.link}
      target="_blank"
      rel="noreferrer"
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        p: '8px 12px 5px',
        borderRadius: '14px',
        '&:hover': {
          backgroundColor: 'action.hover'
        }
      }}
    >
      <Box
        component="img"
        src={prop.icon}
        alt={prop.name}
        sx={{ maxWidth: 42, height: 42 }}
      />
      <Typography sx={{ mt: 0.75, textAlign: 'center', fontSize: 12 }}>
        {prop.name}
      </Typography>
    </Box>
  )
}
