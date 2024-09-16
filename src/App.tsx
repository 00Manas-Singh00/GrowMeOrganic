import React, { useEffect, useState, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputNumber } from "primereact/inputnumber";
import { OverlayPanel } from "primereact/overlaypanel";
import { Button } from "primereact/button";
import "primeicons/primeicons.css";
import axios from "axios";

interface Artwork {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
}

const App: React.FC = () => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [selectedArtworks, setSelectedArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const rowsPerPage = 12;
  const overlayPanelRef = useRef<any>(null);
  const [selectionCount, setSelectionCount] = useState<number>(0);

  // Fetch artworks data from API
  const fetchArtworks = async (page: number) => {
    try {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${page}&limit=${rowsPerPage}`
      );
      const data = response.data;
      const artworkList: Artwork[] = data.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        place_of_origin: item.place_of_origin,
        artist_display: item.artist_display,
        inscriptions: item.inscriptions,
        date_start: item.date_start,
        date_end: item.date_end,
      }));
      setArtworks(artworkList);
      setTotalRecords(data.pagination.total); // Assuming the API returns a total record count
    } catch (error) {
      console.error("Error fetching artworks:", error);
    }
  };

  useEffect(() => {
    fetchArtworks(page);
  }, [page]);

  // Handle row selection from input number
  const handleRowSelection = async (selectionCount: number) => {
    let totalSelectedRows: Artwork[] = [];
    let currentPage = page;
    let remainingToSelect = selectionCount;

    while (remainingToSelect > 0) {
      const response = await axios.get(
        `https://api.artic.edu/api/v1/artworks?page=${currentPage}&limit=${rowsPerPage}`
      );
      const data = response.data.data;

      // Calculate the number of rows to select on the current page
      const rowsToSelect = Math.min(data.length, remainingToSelect);
      totalSelectedRows = [
        ...totalSelectedRows,
        ...data.slice(0, rowsToSelect),
      ];

      remainingToSelect -= rowsToSelect;
      currentPage += 1;

      if (totalSelectedRows.length >= totalRecords) {
        break; // Stop if we have selected all rows
      }
    }

    setSelectedArtworks(totalSelectedRows);
  };

  // Handle selection change from DataTable
  const onSelectionChange = (e: any) => {
    setSelectedArtworks(e.value);
  };

  return (
    <div className="App">
      <DataTable
        value={artworks}
        paginator
        rows={rowsPerPage}
        lazy
        totalRecords={totalRecords}
        onPage={(e) => setPage(e.page + 1)}
        dataKey="id"
        selection={selectedArtworks}
        onSelectionChange={onSelectionChange}
        selectionMode="multiple"
      >
        <Column
          selectionMode="multiple"
          headerStyle={{ width: "3em" }}
          headerCheckbox
        ></Column>
        <Column
          field="title"
          header={
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-evenly",
                }}
              >
                <Button
                  icon="pi pi-chevron-down"
                  onClick={(e) => overlayPanelRef.current.toggle(e)}
                  className="p-button-text"
                  style={{ backgroundColor: "white" }}
                />
                <OverlayPanel ref={overlayPanelRef}>
                  <div
                    className="p-field"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <label htmlFor="row-selection">Select Rows</label>
                    <InputNumber
                      id="row-selection"
                      value={selectionCount}
                      onValueChange={(e) => setSelectionCount(e.value)}
                      placeholder="Enter number of rows"
                    />
                    <Button
                      label="Select"
                      onClick={() => handleRowSelection(selectionCount)}
                      className="mt-2"
                    />
                  </div>
                </OverlayPanel>
                <p
                  style={{
                    marginLeft: "10px",
                  }}
                >
                  Title
                </p>
              </div>
            </>
          }
        ></Column>
        <Column field="place_of_origin" header="Place of Origin"></Column>
        <Column field="artist_display" header="Artist"></Column>
        <Column field="inscriptions" header="Inscriptions"></Column>
        <Column field="date_start" header="Date Start"></Column>
        <Column field="date_end" header="Date End"></Column>
      </DataTable>
    </div>
  );
};

export default App;
