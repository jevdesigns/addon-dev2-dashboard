import React from 'react'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'

export default function EntityList({entities, onSelect}){
  return (
    <List>
      {entities.map(e => (
        <ListItem button key={e} onClick={() => onSelect(e)}>
          <ListItemText primary={e} />
        </ListItem>
      ))}
    </List>
  )
}
