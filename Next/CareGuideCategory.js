import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'
import { isEmpty } from 'lodash'
import { Typography } from '@material-ui/core'
import Head from 'next/head'

import Button from '../../../components/shared/Button'
import AppRoutes from '../../../components/shared/AppRoutes'
import ImgMediaCard from '../../../components/shared/ImgMediaCard'
import { categories } from '../../../components/shared/ImgMediaCard/categories'
import { paingForCareArticles } from '../../../components/shared/ImgMediaCard/articles'
import BreadCrumb from '../../../components/shared/AppRoutes/Breadcrumb'
import { Mixpanel } from '../../../utils/functions/mixpanel'

function CareGuideCategory({ articles }) {
  const [idx, setIdx] = useState(6)
  const router = useRouter()

  useEffect(() => {
    Mixpanel.track(`Visit to Care-Guide category`, {
      categoryName: router.query.name,
    })
  }, [])

  return (
    <React.Fragment>
      <Head>
        <title>
          {categories[router.query.name]} | Care Guide | caredupon.ca
        </title>
      </Head>
      <div className="care-guide-item">
        <AppRoutes />
        <BreadCrumb router={router} categories={categories} />
        <header>
          <h1>{categories[router.query.name]}</h1>
          <h5>
            Learn about your different financial options to pay and budget for
            senior care.
          </h5>
        </header>
        <div className="main-article">
          {!isEmpty(articles) && articles[0] && (
            <ImgMediaCard
              id={articles[0].id}
              img={articles[0].image}
              imgAltTxt={articles[0].Image_alt_text}
              date={articles[0].created_at}
              title={articles[0].main_title}
              category={articles[0].category}
              description={articles[0].into_text}
            />
          )}
        </div>
        <div className="main-content">
          {!isEmpty(articles) ? (
            <div className="articles">
              {[...articles].splice(1, idx).map((arc) => (
                <ImgMediaCard
                  key={arc.id}
                  id={arc.id}
                  img={arc.image}
                  imgAltTxt={arc.Image_alt_text}
                  addClass="article"
                  date={arc.created_at}
                  title={arc.main_title}
                  description={arc.text_1}
                  category={arc.category}
                />
              ))}
            </div>
          ) : (
            <Typography
              variant="h4"
              gutterBottom
              component="div"
              style={{ textAlign: 'center' }}
            >
              No articles
            </Typography>
          )}
          <div className="actions">
            {!isEmpty(articles) && articles.length > 6 && idx === 6 && (
              <Button
                title="View more"
                type="main_info"
                onClick={() => setIdx(paingForCareArticles.length)}
              />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}

export default CareGuideCategory
