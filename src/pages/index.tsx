import { Outlet } from 'umi';

export default function HomePage() {
  return <Outlet />;
}

// export async function clientLoader() {
  // const data = await new Promise((resolve,reject) =>{
  //   CourseService.getInstance().list({} as CoursePo).subscribe({
  //     next: (value) => {
  //       resolve(value)
  //     },
  //     error: (err) => {
  //       reject(err) 
  //     },
  //   })
    
  // });
  // console.log(data);
  // return data;
// }