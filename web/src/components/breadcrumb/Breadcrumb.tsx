import React from 'react';
import Link from 'next/link';

export default function Breadcrumb({ title, subpage, page }) {

  return (
    <section className="breadcrumb-area overlay-dark d-flex align-items-center">
      <div className="container">
        <div className="row">
          <div className="col-12">
            {/* Breamcrumb Content */}
            <div className="breadcrumb-content text-center">
              <h2 className="m-0" style={{fontSize:"3rem"}}>{title}</h2>
              <ol className="breadcrumb d-flex justify-content-center">
                <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                <li className="breadcrumb-item"><Link href="#">{subpage}</Link></li>
                <li className="breadcrumb-item active">{page}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}