"use client";
import React from "react";
import axios from "axios";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserContext } from "../context/UserProvider";
import { useContext } from "react";
import { BsCheck } from "react-icons/bs";
import { FaCross } from "react-icons/fa";
import Navbar from "../components/Navbar";
import TestService from "../services/test";
import { ITest } from "../interfaces/ITest";
import { useQuery } from "react-query";

interface ProblemType {
  _id: string;
  title: string;
  description: string;
  number: number;
  tags: Array<string>;
  comapany: Array<string>;
  level: string;
  slug: string;
}

const Problems = () => {
  const [data, setData] = useState<ProblemType[]>();
  const { user, setUser } = useContext<any>(UserContext);
  const [solved, setSolved] = useState<number[]>();
  const [problems, setProblems] = useState<ITest["data"]>();
  const [loaded, setLoaded] = useState<boolean>(false);

  let ps: ProblemType[];
  const lim = 50;
  const getProblems = async () => {
    try {
      const d = await axios.post("/api/problem/get", { lim });
      ps = d.data.data;
      setData(d.data.data);
      // console.log(data && data[0].title)
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const getSolvedProblems = async () => {
    try {
      if (!user) {
        return null;
      }
      const data = await axios.post("/api/users/getSolved", {
        email: user.email,
      });
      setSolved(data.data.record[0].solved);
    } catch (error: any) {
      console.log(error.message);
      console.log("error");
    }
  };

  useEffect(() => {
    getProblems();
    getSolvedProblems();
  }, [user]);

  const { isLoading, error, isFetched } = useQuery({
    // queryKey:["problem"],
    queryFn: async () => {
      const res = await TestService.getProblems<ITest>(lim);
      setLoaded(true);
    },
    enabled: loaded ? false : true,
  });
  if (isLoading) {
    console.log("loading data");
  }
  if (isFetched) {
    console.log("data received");
  }

  const handleReq = async () => {
    console.log("here");
    const res = await TestService.getProblems<ITest>(10).then(({ data }) => {
      setProblems(data);
      console.log("data ", problems);
    });
  };

  return (
    <div>
      {/* <Navbar /> */}
      <div className="mt-24 flex justify-center mx-auto">
        <table className="w-full max-w-7xl text-center space-x-10 border p-10">
          <thead className="text-lg font-bold p-2">
            <tr className="p-3">
              <td>Status</td>
              <td>Number</td>
              <td>Title</td>
              <td>Tags</td>
              <td>Difficulty</td>
            </tr>
          </thead>
          <tbody>
            {data &&
              data.map((problem, idx) => {
                const difficulyColor =
                  problem.level === "easy"
                    ? "text-green-400"
                    : problem.level === "medium"
                    ? "text-orange-400"
                    : "text-red-400";
                return (
                  <tr
                    key={idx}
                    className={`${
                      problem.number % 2 == 1 ? "bg-stone-400" : ""
                    } m-2`}
                  >
                    <td className="p-5 text-center">
                      {user && solved?.includes(problem.number) === true ? (
                        <p>
                          Yes
                        <BsCheck />
                        </p>
                      ) : (
                        <FaCross />
                      )}
                    </td>
                    <td>{problem.number}</td>
                    <td>
                      <Link
                        className="hover:text-blue-500"
                        href={`/problems/${problem.slug}`}
                      >
                        {problem.title}
                      </Link>
                    </td>
                    <td className="flex flex-wrap flex-row">
                      {problem.tags.map((tag, id) => {
                        return (
                          <span key={id} className="p-2 m-1 rounded">
                            {tag}
                          </span>
                        );
                      })}
                    </td>
                    <td className={`${difficulyColor}`}>
                      {problem.level ? problem.level : "medium"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Problems;
