// 暂时不实现

// import { useEffect, useRef, useState } from 'react'
// import { Button } from 'antd'

// import type { PPTSlide } from '@/ppt/core'
// // import api from '@/services'
// import { useSlidesStore } from '@/ppt/store'
// import ThumbnailSlide from '@/ppt/classic/components/ThumbnailSlide'
// import styles from './Templates.module.scss'

// interface TemplatesProps {
//   onSelect: (slide: PPTSlide) => void
//   onSelectAll: (slides: PPTSlide[]) => void
// }

// export default function Templates({ onSelect, onSelectAll }: TemplatesProps) {
//   const { templates } = useSlidesStore((state) => ({ templates: state.templates }))
//   const [slides, setSlides] = useState<PPTSlide[]>([])
//   const [activeType, setActiveType] = useState('all')
//   const [activeCatalog, setActiveCatalog] = useState('')
//   const listRef = useRef<HTMLDivElement | null>(null)

//   const types = [
//     { label: '全部', value: 'all' },
//     { label: '封面', value: 'cover' },
//     { label: '目录', value: 'contents' },
//     { label: '过渡', value: 'transition' },
//     { label: '内容', value: 'content' },
//     { label: '结束', value: 'end' },
//   ]

//   const changeCatalog = (id: string) => {
//     setActiveCatalog(id)
//     api.getFileData(id).then((ret) => {
//       setSlides(ret.slides)
//       listRef.current?.scrollTo(0, 0)
//     })
//   }

//   useEffect(() => {
//     if (!templates.length) return
//     if (!activeCatalog) changeCatalog(templates[0].id)
//   }, [activeCatalog, templates])

//   return (
//     <div className={styles.templates}>
//       <div className={styles.catalogs}>
//         {templates.map((item) => (
//           <div
//             key={item.id}
//             className={`${styles.catalog} ${activeCatalog === item.id ? styles.active : ''}`}
//             onClick={() => changeCatalog(item.id)}
//           >
//             {item.name}
//           </div>
//         ))}
//       </div>
//       <div className={styles.content}>
//         <div className={styles.header}>
//           <div className={styles.types}>
//             {types.map((item) => (
//               <div
//                 key={item.value}
//                 className={`${styles.type} ${activeType === item.value ? styles.active : ''}`}
//                 onClick={() => setActiveType(item.value)}
//               >
//                 {item.label}
//               </div>
//             ))}
//           </div>
//           <div className={styles['insert-all']} onClick={() => onSelectAll(slides)}>插入全部</div>
//         </div>
//         <div className={styles.list} ref={listRef}>
//           {slides
//             .filter((slide) => slide.type === activeType || activeType === 'all')
//             .map((slide) => (
//               <div key={slide.id} className={styles['slide-item']}>
//                 <div className={styles.thumbnail}>
//                   <ThumbnailSlide slide={slide} size={180} />
//                 </div>
//                 <div className={styles.btns}>
//                   <Button className={styles.btn} type="primary" size="small" onClick={() => onSelect(slide)}>
//                     插入模板
//                   </Button>
//                 </div>
//               </div>
//             ))}
//         </div>
//       </div>
//     </div>
//   )
// }
