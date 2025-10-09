import { useRef, useEffect } from "react";

const AddressAutocomplete = ({ value, onChange }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "cl" }
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          onChange({ target: { name: "address", value: place.formatted_address } });
        }
      });
    }
  }, [onChange]);

  return (
    <input
      ref={inputRef}
      type="text"
      name="address"
      value={value}
      onChange={onChange}
      placeholder="Calle 123, Comuna"
      required
      style={{ backgroundColor: "#44448670", color: "#FFFFFF" }}
      className="form-control"
    />
  );
};

export default AddressAutocomplete;